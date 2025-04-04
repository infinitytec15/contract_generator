import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

/**
 * @swagger
 * /reports/plans:
 *   get:
 *     summary: Obtém relatório de planos
 *     description: Retorna dados de planos e assinaturas para relatórios com base no período selecionado. Administradores podem ver todos os dados, enquanto usuários regulares só podem ver seus próprios dados.
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
 *         name: planId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do plano
 *     responses:
 *       200:
 *         description: Dados do relatório de planos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       plan_id:
 *                         type: string
 *                       plan_name:
 *                         type: string
 *                       amount:
 *                         type: number
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
 *                     canceled:
 *                       type: integer
 *                     revenue:
 *                       type: number
 *                 planDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       plan_name:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       revenue:
 *                         type: number
 *                 monthly:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       revenue:
 *                         type: number
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
    const planId = url.searchParams.get("planId");

    // Base query - join subscriptions with plans to get plan names
    let query = supabase.from("subscriptions").select(
      `
        *,
        plans:plan_id(name, price)
      `,
    );

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

    // Apply plan filter if provided
    if (planId) {
      query = query.eq("plan_id", planId);
    }

    // Order by created_at descending
    query = query.order("created_at", { ascending: false });

    const { data: subscriptions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process subscriptions to include plan name
    const processedSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      plan_name: sub.plans?.name || "Unknown Plan",
      amount: sub.plans?.price || 0,
      plans: undefined, // Remove the nested plans object
    }));

    // Calculate summary statistics
    const total = processedSubscriptions.length;
    const active = processedSubscriptions.filter(
      (s) => s.status === "active",
    ).length;
    const canceled = processedSubscriptions.filter(
      (s) => s.status === "canceled",
    ).length;
    const revenue = processedSubscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, sub) => sum + (sub.amount || 0), 0);

    // Calculate plan distribution
    const planDistributionMap = {};
    processedSubscriptions.forEach((sub) => {
      const planName = sub.plan_name;
      if (!planDistributionMap[planName]) {
        planDistributionMap[planName] = {
          plan_name: planName,
          count: 0,
          revenue: 0,
        };
      }
      planDistributionMap[planName].count += 1;
      if (sub.status === "active") {
        planDistributionMap[planName].revenue += sub.amount || 0;
      }
    });
    const planDistribution = Object.values(planDistributionMap);

    // Calculate monthly statistics
    const monthlyData = {};
    processedSubscriptions.forEach((sub) => {
      if (sub.created_at) {
        const date = new Date(sub.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthName = date.toLocaleString("default", { month: "short" });

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthName,
            count: 0,
            revenue: 0,
            year: date.getFullYear(),
            monthNum: date.getMonth() + 1,
          };
        }
        monthlyData[monthYear].count += 1;
        if (sub.status === "active") {
          monthlyData[monthYear].revenue += sub.amount || 0;
        }
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
        revenue: item.revenue,
      }));

    return NextResponse.json({
      subscriptions: processedSubscriptions,
      summary: {
        total,
        active,
        canceled,
        revenue,
      },
      planDistribution,
      monthly,
    });
  } catch (error: any) {
    console.error("Error fetching plans report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plans report" },
      { status: 500 },
    );
  }
}
