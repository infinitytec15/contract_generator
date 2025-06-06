import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import PlanManagement from "@/components/admin/PlanManagement";

export default async function AdminPlansPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
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
    return redirect("/dashboard");
  }

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-6">
            Gerenciamento de Planos
          </h1>
          <PlanManagement />
        </div>
      </main>
    </>
  );
}
