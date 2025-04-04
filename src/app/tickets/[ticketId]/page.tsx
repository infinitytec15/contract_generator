"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import TicketTimeline from "@/components/tickets/TicketTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, FileText, MessageSquare, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TicketDetailsPage({
  params,
}: {
  params: { ticketId: string };
}) {
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch ticket details
        const { data, error } = await supabase
          .from("tickets")
          .select("*, users(email, full_name)")
          .eq("id", params.ticketId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        // Check if user has permission to view this ticket
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
          (ur) =>
            ur.roles?.name === "admin" || ur.roles?.name === "super_admin",
        );

        if (!isAdmin && data.user_id !== user.id) {
          router.push("/tickets");
          return;
        }

        setTicket(data);
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError("Não foi possível carregar os detalhes do ticket.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.ticketId, router]);

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
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

  const getDepartmentLabel = (department: string) => {
    switch (department) {
      case "support":
        return "Suporte Técnico";
      case "billing":
        return "Faturamento";
      case "sales":
        return "Vendas";
      default:
        return "Outro";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <DashboardSidebar />
        <main className="pt-16 pl-64">
          <div className="p-6">
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <DashboardSidebar />
        <main className="pt-16 pl-64">
          <div className="p-6">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error || "Ticket não encontrado"}
            </div>
            <Button
              onClick={() => router.push("/tickets")}
              className="mt-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Tickets
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <DashboardSidebar />
      <main className="pt-16 pl-64">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push("/tickets")}
                className="mb-2 flex items-center gap-2 -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Tickets
              </Button>
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status === "open"
                    ? "Aberto"
                    : ticket.status === "in_progress"
                      ? "Em Progresso"
                      : ticket.status === "responded"
                        ? "Respondido"
                        : ticket.status === "awaiting_response"
                          ? "Aguardando Resposta"
                          : ticket.status === "resolved"
                            ? "Resolvido"
                            : "Fechado"}
                </Badge>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority === "high"
                    ? "Alta"
                    : ticket.priority === "medium"
                      ? "Média"
                      : "Baixa"}{" "}
                  Prioridade
                </Badge>
                <span className="text-sm text-gray-500">ID: {ticket.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>Informações do Ticket</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Departamento:
                      </dt>
                      <dd className="text-sm">
                        {getDepartmentLabel(ticket.department)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Criado em:
                      </dt>
                      <dd className="text-sm">
                        {formatDate(ticket.created_at)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Última atualização:
                      </dt>
                      <dd className="text-sm">
                        {formatDate(ticket.updated_at)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Status:
                      </dt>
                      <dd className="text-sm">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status === "open"
                            ? "Aberto"
                            : ticket.status === "in_progress"
                              ? "Em Progresso"
                              : ticket.status === "responded"
                                ? "Respondido"
                                : ticket.status === "awaiting_response"
                                  ? "Aguardando Resposta"
                                  : ticket.status === "resolved"
                                    ? "Resolvido"
                                    : "Fechado"}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Prioridade:
                      </dt>
                      <dd className="text-sm">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority === "high"
                            ? "Alta"
                            : ticket.priority === "medium"
                              ? "Média"
                              : "Baixa"}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Solicitante</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm">
                        <span className="font-medium">Nome:</span>{" "}
                        {ticket.users?.full_name || "N/A"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span>{" "}
                        {ticket.users?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Descrição</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </CardContent>
              </Card>

              <TicketTimeline ticketId={params.ticketId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
