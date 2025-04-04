import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and has super_admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has super_admin role
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(
        `
        role_id,
        roles(name)
      `,
      )
      .eq("user_id", user.id);

    const isSuperAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "super_admin",
    );

    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get dashboard statistics
    const [clientsResult, plansResult, paymentsResult, usersResult] =
      await Promise.all([
        // Total clients and status counts
        supabase.from("clients").select("id, status, payment_status"),

        // Plans data
        supabase.from("plans").select("id, name, is_active"),

        // Payment data
        supabase.from("client_payments").select("id, status, due_date"),

        // Recent users
        supabase
          .from("users")
          .select("id, email, full_name, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

    if (clientsResult.error) throw clientsResult.error;
    if (plansResult.error) throw plansResult.error;
    if (paymentsResult.error) throw paymentsResult.error;
    if (usersResult.error) throw usersResult.error;

    const clients = clientsResult.data || [];
    const plans = plansResult.data || [];
    const payments = paymentsResult.data || [];
    const recentUsers = usersResult.data || [];

    // Calculate statistics
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === "active").length;
    const inactiveClients = clients.filter(
      (c) => c.status === "inactive",
    ).length;
    const totalPlans = plans.length;
    const activePlans = plans.filter((p) => p.is_active).length;
    const overduePayments = payments.filter(
      (p) => p.status === "overdue",
    ).length;

    // Get monthly client registrations for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);

    const monthlyRegistrations = [];
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
        .from("clients")
        .select("id")
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd);

      if (error) throw error;

      monthlyRegistrations.push({
        month: month.toLocaleString("default", { month: "short" }),
        count: data.length,
      });
    }

    // Get payment status distribution
    const paymentStatusCounts = {
      paid: payments.filter((p) => p.status === "paid").length,
      pending: payments.filter((p) => p.status === "pending").length,
      overdue: payments.filter((p) => p.status === "overdue").length,
    };

    return NextResponse.json({
      stats: {
        totalClients,
        activeClients,
        inactiveClients,
        totalPlans,
        activePlans,
        overduePayments,
      },
      charts: {
        monthlyRegistrations,
        paymentStatusCounts,
      },
      recentUsers,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
