"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { format } from "date-fns";
import { Download, BarChart3, Users, CreditCard } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function ReportsPage() {
  const [date, setDate] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  // State for data
  const [contractsData, setContractsData] = useState(null);
  const [clientsData, setClientsData] = useState(null);
  const [plansData, setPlansData] = useState(null);
  const [loading, setLoading] = useState({
    contracts: true,
    clients: true,
    plans: true,
  });

  // Fetch data when date range changes
  useEffect(() => {
    if (date.from && date.to) {
      fetchReportsData();
    }
  }, [date]);

  const fetchReportsData = async () => {
    setLoading({ contracts: true, clients: true, plans: true });

    // Format dates for API
    const startDate = format(date.from, "yyyy-MM-dd");
    const endDate = format(date.to, "yyyy-MM-dd");

    // Fetch contracts data
    try {
      const contractsResponse = await fetch(
        `/api/reports/contracts?startDate=${startDate}&endDate=${endDate}`,
      );
      if (contractsResponse.ok) {
        const data = await contractsResponse.json();
        setContractsData(data);
      } else {
        console.error("Failed to fetch contracts data");
      }
    } catch (error) {
      console.error("Error fetching contracts data:", error);
    } finally {
      setLoading((prev) => ({ ...prev, contracts: false }));
    }

    // Fetch clients data
    try {
      const clientsResponse = await fetch(
        `/api/reports/clients?startDate=${startDate}&endDate=${endDate}`,
      );
      if (clientsResponse.ok) {
        const data = await clientsResponse.json();
        setClientsData(data);
      } else {
        console.error("Failed to fetch clients data");
      }
    } catch (error) {
      console.error("Error fetching clients data:", error);
    } finally {
      setLoading((prev) => ({ ...prev, clients: false }));
    }

    // Fetch plans data
    try {
      const plansResponse = await fetch(
        `/api/reports/plans?startDate=${startDate}&endDate=${endDate}`,
      );
      if (plansResponse.ok) {
        const data = await plansResponse.json();
        setPlansData(data);
      } else {
        console.error("Failed to fetch plans data");
      }
    } catch (error) {
      console.error("Error fetching plans data:", error);
    } finally {
      setLoading((prev) => ({ ...prev, plans: false }));
    }
  };

  // Prepare chart data for contracts
  const contractsChartData = contractsData?.monthly
    ? {
        labels: contractsData.monthly.map((item) => item.month),
        datasets: [
          {
            label: "Contratos Gerados",
            data: contractsData.monthly.map((item) => item.count),
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Prepare chart data for clients
  const clientsChartData = clientsData?.monthly
    ? {
        labels: clientsData.monthly.map((item) => item.month),
        datasets: [
          {
            label: "Novos Clientes",
            data: clientsData.monthly.map((item) => item.count),
            backgroundColor: "rgba(255, 159, 64, 0.2)",
            borderColor: "rgba(255, 159, 64, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Prepare chart data for plans
  const plansChartData = plansData?.planDistribution
    ? {
        labels: plansData.planDistribution.map((item) => item.plan_name),
        datasets: [
          {
            label: "Vendas por Plano",
            data: plansData.planDistribution.map((item) => item.count),
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const handleExportCSV = (reportType: string) => {
    // Format dates for filename
    const startDateStr = format(date.from, "yyyy-MM-dd");
    const endDateStr = format(date.to, "yyyy-MM-dd");
    const filename = `${reportType}_${startDateStr}_to_${endDateStr}.csv`;

    let csvContent = "";
    let data = [];

    // Prepare data based on report type
    switch (reportType) {
      case "contracts-monthly":
        if (!contractsData?.monthly) return;
        csvContent = "Month,Count\n";
        data = contractsData.monthly.map(
          (item) => `${item.month},${item.count}`,
        );
        break;

      case "contracts-list":
        if (!contractsData?.contracts) return;
        csvContent = "ID,Name,Client,Status,Created At\n";
        data = contractsData.contracts.map(
          (contract) =>
            `${contract.id},"${contract.name || "Sem nome"}","${contract.client_name || "Cliente não especificado"}",${contract.status},${contract.created_at}`,
        );
        break;

      case "clients-monthly":
        if (!clientsData?.monthly) return;
        csvContent = "Month,Count\n";
        data = clientsData.monthly.map((item) => `${item.month},${item.count}`);
        break;

      case "clients-list":
        if (!clientsData?.clients) return;
        csvContent = "ID,Name,Email,Status,Created At\n";
        data = clientsData.clients.map(
          (client) =>
            `${client.id},"${client.name || "Sem nome"}","${client.email || "Email não especificado"}",${client.status},${client.created_at}`,
        );
        break;

      case "plan-distribution":
        if (!plansData?.planDistribution) return;
        csvContent = "Plan,Count\n";
        data = plansData.planDistribution.map(
          (item) => `"${item.plan_name}",${item.count}`,
        );
        break;

      case "subscriptions-list":
        if (!plansData?.subscriptions) return;
        csvContent = "ID,User ID,Plan,Amount,Status,Created At\n";
        data = plansData.subscriptions.map(
          (subscription) =>
            `${subscription.id},${subscription.user_id || "Não especificado"},"${subscription.plan_name || "Plano não especificado"}",${subscription.amount || 0},${subscription.status},${subscription.created_at}`,
        );
        break;

      default:
        console.error("Unknown report type:", reportType);
        return;
    }

    // Combine header and data
    csvContent += data.join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-4">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      <Tabs defaultValue="contracts">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="contracts" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Planos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total de Contratos</CardTitle>
                <CardDescription>No período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.contracts
                    ? "..."
                    : contractsData?.summary?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Contratos Assinados</CardTitle>
                <CardDescription>No período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.contracts
                    ? "..."
                    : contractsData?.summary?.signed || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Contratos Pendentes</CardTitle>
                <CardDescription>No período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.contracts
                    ? "..."
                    : contractsData?.summary?.pending || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Contratos por Mês</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("contracts-monthly")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Total de contratos gerados por mês no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {loading.contracts ? (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                    <p className="text-gray-500">Carregando dados...</p>
                  </div>
                ) : contractsChartData ? (
                  <Bar
                    data={contractsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                    <p className="text-gray-500">Nenhum dado disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Contratos</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("contracts-list")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Detalhes de todos os contratos no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading.contracts ? (
                      <tr>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          colSpan={4}
                        >
                          Carregando...
                        </td>
                      </tr>
                    ) : contractsData?.contracts?.length > 0 ? (
                      contractsData.contracts.slice(0, 10).map((contract) => (
                        <tr key={contract.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.name || "Sem nome"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.client_name || "Cliente não especificado"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.status === "signed"
                              ? "Assinado"
                              : contract.status === "pending"
                                ? "Pendente"
                                : contract.status === "draft"
                                  ? "Rascunho"
                                  : contract.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(contract.created_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          colSpan={4}
                        >
                          Nenhum contrato encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total de Clientes</CardTitle>
                <CardDescription>No período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.clients ? "..." : clientsData?.summary?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Clientes Ativos</CardTitle>
                <CardDescription>No período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.clients ? "..." : clientsData?.summary?.active || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Clientes Inativos</CardTitle>
                <CardDescription>No período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.clients
                    ? "..."
                    : clientsData?.summary?.inactive || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Novos Clientes por Mês</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("clients-monthly")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Total de novos clientes por mês no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {loading.clients ? (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                    <p className="text-gray-500">Carregando dados...</p>
                  </div>
                ) : clientsChartData ? (
                  <Bar
                    data={clientsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                    <p className="text-gray-500">Nenhum dado disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Clientes</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("clients-list")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Detalhes de todos os clientes no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Cadastro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading.clients ? (
                      <tr>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          colSpan={4}
                        >
                          Carregando...
                        </td>
                      </tr>
                    ) : clientsData?.clients?.length > 0 ? (
                      clientsData.clients.slice(0, 10).map((client) => (
                        <tr key={client.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.name || "Sem nome"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.email || "Email não especificado"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.status === "active"
                              ? "Ativo"
                              : client.status === "inactive"
                                ? "Inativo"
                                : client.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(client.created_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          colSpan={4}
                        >
                          Nenhum cliente encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total de Assinaturas</CardTitle>
                <CardDescription>No período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.plans ? "..." : plansData?.summary?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Assinaturas Ativas</CardTitle>
                <CardDescription>No período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.plans ? "..." : plansData?.summary?.active || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Receita Total</CardTitle>
                <CardDescription>No período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.plans
                    ? "..."
                    : plansData?.summary?.revenue
                      ? `R$ ${plansData.summary.revenue.toFixed(2)}`
                      : "R$ 0,00"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Vendas por Plano</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("plan-distribution")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Distribuição de vendas por plano no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {loading.plans ? (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                    <p className="text-gray-500">Carregando dados...</p>
                  </div>
                ) : plansChartData ? (
                  <Bar
                    data={plansChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                    <p className="text-gray-500">Nenhum dado disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Assinaturas</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("subscriptions-list")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Detalhes de todas as assinaturas no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID do Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plano
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading.plans ? (
                      <tr>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          colSpan={5}
                        >
                          Carregando...
                        </td>
                      </tr>
                    ) : plansData?.subscriptions?.length > 0 ? (
                      plansData.subscriptions
                        .slice(0, 10)
                        .map((subscription) => (
                          <tr key={subscription.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscription.user_id || "Não especificado"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscription.plan_name ||
                                "Plano não especificado"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscription.amount
                                ? `R$ ${subscription.amount.toFixed(2)}`
                                : "R$ 0,00"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscription.status === "active"
                                ? "Ativo"
                                : subscription.status === "canceled"
                                  ? "Cancelado"
                                  : subscription.status}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(subscription.created_at)}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          colSpan={5}
                        >
                          Nenhuma assinatura encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
