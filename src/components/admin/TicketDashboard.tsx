"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export default function TicketDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    responded: 0,
    awaitingResponse: 0,
    resolved: 0,
    closed: 0,
    avgResponseTime: 0,
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...tickets];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.users?.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (ticket.users?.full_name &&
            ticket.users.full_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, tickets]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch all tickets with user information
      const { data, error } = await supabase
        .from("tickets")
        .select("*, users(email, full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTickets(data || []);
      setFilteredTickets(data || []);

      // Calculate statistics
      if (data) {
        const openTickets = data.filter((t) => t.status === "open").length;
        const inProgressTickets = data.filter(
          (t) => t.status === "in_progress",
        ).length;
        const respondedTickets = data.filter(
          (t) => t.status === "responded",
        ).length;
        const awaitingResponseTickets = data.filter(
          (t) => t.status === "awaiting_response",
        ).length;
        const resolvedTickets = data.filter(
          (t) => t.status === "resolved",
        ).length;
        const closedTickets = data.filter((t) => t.status === "closed").length;

        // Calculate average response time (mock data for now)
        // In a real app, you would calculate this from actual response timestamps
        const avgResponseTime = Math.floor(Math.random() * 24) + 1; // Random hours between 1-24

        setStats({
          total: data.length,
          open: openTickets,
          inProgress: inProgressTickets,
          responded: respondedTickets,
          awaitingResponse: awaitingResponseTickets,
          resolved: resolvedTickets,
          closed: closedTickets,
          avgResponseTime,
        });
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "responded":
        return "bg-indigo-100 text-indigo-800";
      case "awaiting_response":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "Aberto";
      case "in_progress":
        return "Em Progresso";
      case "responded":
        return "Respondido";
      case "awaiting_response":
        return "Aguardando Resposta";
      case "resolved":
        return "Resolvido";
      case "closed":
        return "Fechado";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Chart data for status distribution
  const statusChartData = {
    labels: [
      "Aberto",
      "Em Progresso",
      "Respondido",
      "Aguardando Resposta",
      "Resolvido",
      "Fechado",
    ],
    datasets: [
      {
        label: "Tickets por Status",
        data: [
          stats.open,
          stats.inProgress,
          stats.responded,
          stats.awaitingResponse,
          stats.resolved,
          stats.closed,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.6)", // blue
          "rgba(139, 92, 246, 0.6)", // purple
          "rgba(79, 70, 229, 0.6)", // indigo
          "rgba(249, 115, 22, 0.6)", // orange
          "rgba(16, 185, 129, 0.6)", // green
          "rgba(156, 163, 175, 0.6)", // gray
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(79, 70, 229, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(156, 163, 175, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for response time (mock data)
  const responseTimeData = {
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    datasets: [
      {
        label: "Tempo Médio de Resposta (horas)",
        data: [4, 3, 5, 2, 3, 6, 4], // Mock data
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Tickets
                </p>
                <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tickets Abertos
                </p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats.open + stats.inProgress + stats.awaitingResponse}
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tickets Resolvidos
                </p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats.resolved + stats.closed}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tempo Médio de Resposta
                </p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats.avgResponseTime}h
                </h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              <span>Distribuição de Tickets por Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie
                data={statusChartData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Tempo Médio de Resposta (Últimos 7 dias)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={responseTimeData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Horas",
                      },
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
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Todos os Tickets</span>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tickets..."
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="open">Aberto</option>
              <option value="in_progress">Em Progresso</option>
              <option value="responded">Respondido</option>
              <option value="awaiting_response">Aguardando Resposta</option>
              <option value="resolved">Resolvido</option>
              <option value="closed">Fechado</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <XCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Nenhum ticket encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ticket
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Solicitante
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Prioridade
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.description.length > 50
                            ? `${ticket.description.substring(0, 50)}...`
                            : ticket.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.users?.full_name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ticket.users?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority === "high"
                            ? "Alta"
                            : ticket.priority === "medium"
                              ? "Média"
                              : "Baixa"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/tickets/${ticket.id}`)}
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
