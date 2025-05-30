"use client";

import { useEffect, useState, useRef } from "react";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, PenTool, Plus, Users, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const statsRefs = useRef([]);

  // Reset refs array when component mounts
  useEffect(() => {
    statsRefs.current = statsRefs.current.slice(0, 0);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Apply GSAP animations when data is loaded
  useEffect(() => {
    if (!loading && dashboardData && statsRefs.current.length > 0) {
      // Animate stats cards
      gsap.fromTo(
        statsRefs.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" },
      );
    }
  }, [loading, dashboardData]);

  // If no data is available yet, show loading state
  if (loading) {
    return (
      <>
        <DashboardHeader />
        <DashboardSidebar />
        <main className="p-4 sm:ml-64 pt-20">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((_, index) => (
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

  // If there's an error, show error state
  if (error) {
    return (
      <>
        <DashboardHeader />
        <DashboardSidebar />
        <main className="p-4 sm:ml-64 pt-20">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-500">
                  <p>Erro ao carregar dados do dashboard: {error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  // Use real data or fallback to empty values
  const stats = dashboardData
    ? [
        {
          title: "Total de contratos",
          value: dashboardData.stats.totalContracts || 0,
          icon: FileText,
          color: "bg-blue-100 text-blue-600",
        },
        {
          title: "Contratos pendentes",
          value: dashboardData.stats.pendingContracts || 0,
          icon: Clock,
          color: "bg-orange-100 text-orange-600",
        },
        {
          title: "Contratos assinados",
          value: dashboardData.stats.signedContracts || 0,
          icon: PenTool,
          color: "bg-green-100 text-green-600",
        },
        {
          title: "Total de clientes",
          value: dashboardData.stats.totalClients || 0,
          icon: Users,
          color: "bg-purple-100 text-purple-600",
        },
      ]
    : [];

  // Chart data for monthly contracts
  const monthlyContractsData = {
    labels:
      dashboardData?.charts.monthlyContracts.map((item) => item.month) || [],
    datasets: [
      {
        label: "Contratos criados",
        data:
          dashboardData?.charts.monthlyContracts.map((item) => item.count) ||
          [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
    ],
  };

  // Chart data for contract status
  const contractStatusData = {
    labels: ["Assinados", "Pendentes", "Rascunhos"],
    datasets: [
      {
        label: "Status dos contratos",
        data: dashboardData
          ? [
              dashboardData.charts.contractStatus.signed || 0,
              dashboardData.charts.contractStatus.pending || 0,
              dashboardData.charts.contractStatus.draft || 0,
            ]
          : [0, 0, 0],
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(249, 115, 22, 0.6)",
          "rgba(100, 116, 139, 0.6)",
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
                ref={(el) => (statsRefs.current[index] = el)}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Contratos por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line
                    data={monthlyContractsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Contratos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar
                    data={contractStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Limites do Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Contratos
                  </h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      Utilizados: {dashboardData?.stats.totalContracts || 0}
                    </span>
                    <span className="text-sm font-medium">
                      Limite: {dashboardData?.stats.contractLimit || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${dashboardData ? Math.min(100, (dashboardData.stats.totalContracts / dashboardData.stats.contractLimit) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Clientes
                  </h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      Utilizados: {dashboardData?.stats.totalClients || 0}
                    </span>
                    <span className="text-sm font-medium">
                      Limite: {dashboardData?.stats.clientLimit || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{
                        width: `${dashboardData ? Math.min(100, (dashboardData.stats.totalClients / dashboardData.stats.clientLimit) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
