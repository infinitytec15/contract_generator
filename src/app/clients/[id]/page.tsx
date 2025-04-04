import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import ClientDetails from "@/components/clients/ClientDetails";

export default async function ClientDetailsPage({
  params,
}: {
  params: { id: string };
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

  // If not admin, check if the client belongs to the user
  if (!isAdmin) {
    const { data: client } = await supabase
      .from("clients")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!client || client.user_id !== user.id) {
      return redirect("/clients");
    }
  }

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <ClientDetails
            clientId={params.id}
            isAdmin={isAdmin}
            userId={user.id}
          />
        </div>
      </main>
    </>
  );
}
