import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

/**
 * @swagger
 * /reports/clients:
 *   get:
 *     summary: Obtém relatório de clientes
 *     description: Retorna dados de clientes para relatórios com base no período selecionado. Administradores podem ver todos os clientes, enquanto usuários regulares só podem ver seus próprios clientes.
 *     tags:
 *       - reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filtrar por status do cliente
 *     responses:
 *       200:
 *         description: Dados do relatório de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       status:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     inactive:
 *                       type: integer
 *                 monthly:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(
        `
        role_id,
        roles(name)
      `,
      )
      .eq("user_id", user.id);

    const isSuperAdmin =
      userRoles && userRoles.some((ur) => ur.roles?.name === "super_admin");

    // Get query parameters
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const status = url.searchParams.get("status");

    // Base query
    let query = supabase.from("clients").select("*");

    // Apply user filter if not super admin
    if (!isSuperAdmin) {
      query = query.eq("user_id", user.id);
    }

    // Apply date filters if provided
    if (startDate) {
      query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      query = query.lte("created_at", `${endDate}T23:59:59.999Z`);
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Order by created_at descending
    query = query.order("created_at", { ascending: false });

    const { data: clients, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate summary statistics
    const total = clients.length;
    const active = clients.filter((c) => c.status === "active").length;
    const inactive = clients.filter((c) => c.status === "inactive").length;

    // Calculate monthly statistics
    const monthlyData = {};
    clients.forEach((client) => {
      if (client.created_at) {
        const date = new Date(client.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthName = date.toLocaleString("default", { month: "short" });

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthName,
            count: 0,
            year: date.getFullYear(),
            monthNum: date.getMonth() + 1,
          };
        }
        monthlyData[monthYear].count += 1;
      }
    });

    // Convert to array and sort by date
    const monthly = Object.values(monthlyData)
      .sort((a: any, b: any) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNum - b.monthNum;
      })
      .map((item: any) => ({
        month: item.month,
        count: item.count,
      }));

    return NextResponse.json({
      clients,
      summary: {
        total,
        active,
        inactive,
      },
      monthly,
    });
  } catch (error: any) {
    console.error("Error fetching clients report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch clients report" },
      { status: 500 },
    );
  }
}
