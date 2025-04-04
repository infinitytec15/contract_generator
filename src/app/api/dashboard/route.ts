import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Obtém dados do painel do usuário
 *     description: Retorna estatísticas e dados para o painel do usuário, incluindo informações sobre clientes, contratos e limites do plano.
 *     tags:
 *       - dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do painel do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalClients:
 *                       type: integer
 *                       description: Número total de clientes
 *                     totalContracts:
 *                       type: integer
 *                       description: Número total de contratos
 *                     contractsRemaining:
 *                       type: integer
 *                       description: Número de contratos restantes no plano
 *                     clientsRemaining:
 *                       type: integer
 *                       description: Número de clientes restantes no plano
 *                     signedContracts:
 *                       type: integer
 *                       description: Número de contratos assinados
 *                     pendingContracts:
 *                       type: integer
 *                       description: Número de contratos pendentes
 *                     draftContracts:
 *                       type: integer
 *                       description: Número de contratos em rascunho
 *                     contractLimit:
 *                       type: integer
 *                       description: Limite de contratos do plano
 *                     clientLimit:
 *                       type: integer
 *                       description: Limite de clientes do plano
 *                 charts:
 *                   type: object
 *                   properties:
 *                     monthlyContracts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             description: Nome do mês
 *                           count:
 *                             type: integer
 *                             description: Número de contratos no mês
 *                     contractStatus:
 *                       type: object
 *                       properties:
 *                         signed:
 *                           type: integer
 *                           description: Número de contratos assinados
 *                         pending:
 *                           type: integer
 *                           description: Número de contratos pendentes
 *                         draft:
 *                           type: integer
 *                           description: Número de contratos em rascunho
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

    // Get user's plan limits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (userError) throw userError;

    // Get user's clients
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, status, payment_status")
      .eq("user_id", user.id);

    if (clientsError) throw clientsError;

    // Get user's contracts
    const { data: contracts, error: contractsError } = await supabase
      .from("contracts")
      .select("id, status")
      .eq("user_id", user.id);

    if (contractsError) throw contractsError;

    // Get user's plan
    const { data: userClients, error: userClientsError } = await supabase
      .from("clients")
      .select("plan_id, plans(contract_uploads_limit, client_limit)")
      .eq("user_id", user.id)
      .not("plan_id", "is", null)
      .limit(1);

    if (userClientsError) throw userClientsError;

    // Calculate contract limits based on plan
    let contractLimit = 0;
    let clientLimit = 0;
    if (userClients && userClients.length > 0 && userClients[0].plans) {
      contractLimit = userClients[0].plans.contract_uploads_limit || 0;
      clientLimit = userClients[0].plans.client_limit || 0;
    }

    // Calculate statistics
    const totalClients = clients.length;
    const totalContracts = contracts.length;
    const contractsRemaining = Math.max(0, contractLimit - totalContracts);
    const clientsRemaining = Math.max(0, clientLimit - totalClients);

    // Contract status counts
    const signedContracts = contracts.filter(
      (c) => c.status === "signed",
    ).length;
    const pendingContracts = contracts.filter(
      (c) => c.status === "pending",
    ).length;
    const draftContracts = contracts.filter((c) => c.status === "draft").length;

    // Get monthly contract creation for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);

    const monthlyContracts = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      const monthStart = new Date(
        month.getFullYear(),
        month.getMonth(),
        1,
      ).toISOString();
      const monthEnd = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0,
      ).toISOString();

      const { data, error } = await supabase
        .from("contracts")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd);

      if (error) throw error;

      monthlyContracts.push({
        month: month.toLocaleString("default", { month: "short" }),
        count: data.length,
      });
    }

    return NextResponse.json({
      stats: {
        totalClients,
        totalContracts,
        contractsRemaining,
        clientsRemaining,
        signedContracts,
        pendingContracts,
        draftContracts,
        contractLimit,
        clientLimit,
      },
      charts: {
        monthlyContracts,
        contractStatus: {
          signed: signedContracts,
          pending: pendingContracts,
          draft: draftContracts,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
