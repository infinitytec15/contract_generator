"use client";

import { useEffect, useRef, useState } from "react";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, AlertCircle } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { gsap } from "gsap";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalPlans: number;
  overduePayments: number;
}

interface MonthlyRegistration {
  month: string;
  count: number;
}

interface PaymentStatusCounts {
  paid: number;
  pending: number;
  overdue: number;
}

interface DashboardData {
  stats: DashboardStats;
  charts: {
    monthlyRegistrations: MonthlyRegistration[];
    paymentStatusCounts: PaymentStatusCounts;
  };
  recentUsers: {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
  }[];
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const statsRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    statsRefs.current = [];
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) throw new Error("Erro ao buscar dados do dashboard");
        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && dashboardData && statsRefs.current.length > 0) {
      gsap.fromTo(
          statsRefs.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [loading, dashboardData]);

  if (loading) {
    return (
        <>
          <DashboardHeader />
          <DashboardSidebar />
          <main className="p-4 sm:ml-64 pt-20">
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg border p-4 shadow-sm animate-pulse"
                    >
                      <div className="flex items-center">
                        <div className="rounded-full p-3 mr-4 bg-gray-200 h-12 w-12"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
              <div className="bg-white rounded-lg border p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </>
    );
  }

  if (error) {
    return (
        <>
          <DashboardHeader />
          <DashboardSidebar />
          <main className="p-4 sm:ml-64 pt-20">
            <div className="p-4">
              <Card>
                <CardContent>
                  <p className="text-center text-red-500">Erro: {error}</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </>
    );
  }

  const stats = [
    {
      title: "Total de Clientes",
      value: dashboardData?.stats.totalClients ?? 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Clientes Ativos",
      value: dashboardData?.stats.activeClients ?? 0,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total de Planos",
      value: dashboardData?.stats.totalPlans ?? 0,
      icon: CreditCard,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Pagamentos Atrasados",
      value: dashboardData?.stats.overduePayments ?? 0,
      icon: AlertCircle,
      color: "bg-red-100 text-red-600",
    },
  ];

  const monthlyData = {
    labels: dashboardData?.charts.monthlyRegistrations.map((i) => i.month) || [],
    datasets: [
      {
        label: "Novos Clientes",
        data: dashboardData?.charts.monthlyRegistrations.map((i) => i.count) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const paymentData = {
    labels: ["Pagos", "Pendentes", "Atrasados"],
    datasets: [
      {
        label: "Status dos Pagamentos",
        data: [
          dashboardData?.charts.paymentStatusCounts.paid ?? 0,
          dashboardData?.charts.paymentStatusCounts.pending ?? 0,
          dashboardData?.charts.paymentStatusCounts.overdue ?? 0,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(249, 115, 22, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
      },
    ],
  };

  return (
      <>
        <DashboardHeader />
        <DashboardSidebar />
        <main className="p-4 sm:ml-64 pt-20">
          <div className="p-4">
            <h1 className="text-2xl font-semibold mb-6">Painel Administrativo</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        ref={(el: HTMLDivElement | null) => {
                          statsRefs.current[index] = el;
                        }}
                        className="bg-white rounded-lg border p-4 shadow-sm"
                    >
                      <div className="flex items-center">
                        <div className={`rounded-full p-3 mr-4 ${stat.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                          <p className="text-2xl font-semibold">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registros de Clientes por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Line
                        data={monthlyData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: "top" },
                          },
                        }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status dos Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Bar
                        data={paymentData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                        }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usuários Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Nome</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Data de Registro</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dashboardData?.recentUsers.map((user) => (
                        <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4">{user.full_name || "N/A"}</td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">
                            {new Date(user.created_at).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
  );
}
