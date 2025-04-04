import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import ContractDetails from "@/components/contracts/ContractDetails";

export default async function ContractDetailsPage({
  params,
}: {
  params: { contractId: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Verificar se o contrato existe e se o usuário tem permissão para acessá-lo
  const { data: contract, error } = await supabase
    .from("contracts")
    .select("user_id")
    .eq("id", params.contractId)
    .single();

  if (error || !contract) {
    return redirect("/contracts");
  }

  // Verificar se o usuário é o proprietário do contrato ou um admin
  if (contract.user_id !== user.id) {
    // Verificar se o usuário é admin
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
      (ur) => ur.roles?.name === "admin" || ur.roles?.name === "super_admin",
    );

    if (!isAdmin) {
      return redirect("/contracts");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <ContractDetails contractId={params.contractId} />
        </div>
      </main>
    </div>
  );
}
