import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, PenTool, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock data for dashboard stats
  const stats = [
    {
      title: "Total de contratos",
      value: "24",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Contratos pendentes",
      value: "8",
      icon: FileText,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Contratos assinados",
      value: "16",
      icon: PenTool,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Receita",
      value: "R$ 2.450,00",
      icon: BarChart3,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              <span>Novo Contrato</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border p-4 shadow-sm"
              >
                <div className="flex items-center">
                  <div className={`rounded-full p-3 mr-4 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Atividade recente</h2>
            <div className="text-sm text-gray-500">
              <p>Nenhuma atividade recente para mostrar.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
