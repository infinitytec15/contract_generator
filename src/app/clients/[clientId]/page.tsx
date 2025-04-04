import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import ClientDetails from "@/components/clients/ClientDetails";

export default async function ClientDetailsPage({
  params,
}: {
  params: { clientId: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Check if user has admin or super_admin role
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select(
      `
      role_id,
      roles(name)
    `,
    )
    .eq("user_id", user.id);

  const isAdmin = userRoles?.some(
    (ur) => ur.roles?.name === "super_admin" || ur.roles?.name === "admin",
  );

  // Fetch client data
  const { data: client } = await supabase
    .from("clients")
    .select("*, plans:plan_id(*)")
    .eq("id", params.clientId)
    .single();

  if (!client) {
    return redirect("/clients");
  }

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <ClientDetails client={client} isAdmin={isAdmin} userId={user.id} />
        </div>
      </main>
    </>
  );
}
