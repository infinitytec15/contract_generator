import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import VaultDocuments from "@/components/vault/VaultDocuments";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";

export default async function VaultPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Cofre de Documentos</h1>
            <p className="text-gray-500">
              Armazene e gerencie documentos importantes com segurança adicional
            </p>
          </div>
          <VaultDocuments />
        </div>
      </main>
    </>
  );
}
