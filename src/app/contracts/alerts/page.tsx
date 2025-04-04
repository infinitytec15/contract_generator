import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import AlertsManagement from "@/components/contracts/AlertsManagement";
import { Bell, ArrowLeft } from "lucide-react";

export default async function ContractAlertsPage() {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Verificar se o usuário é administrador
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData || userData.role !== "admin") {
    return redirect("/dashboard?error=Acesso+negado");
  }

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Bell className="h-6 w-6 text-blue-600" />
              <span>Gestão de Alertas de Contratos</span>
            </h1>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AlertsManagement />
            </div>

            <div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Sobre os Alertas
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  O sistema de alertas verifica diariamente os contratos com
                  datas importantes se aproximando e envia notificações conforme
                  configurado.
                </p>
                <h4 className="font-medium text-blue-800 mb-1">
                  Tipos de Alertas:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 mb-3">
                  <li>• Início de vigência</li>
                  <li>• Término de vigência</li>
                  <li>• Renovação</li>
                  <li>• Reajuste</li>
                </ul>
                <h4 className="font-medium text-blue-800 mb-1">
                  Canais de Notificação:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Email</li>
                  <li>• SMS (requer configuração adicional)</li>
                  <li>• Notificações no sistema</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
