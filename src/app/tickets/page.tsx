"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "support", // Default department
    priority: "medium", // Default priority
  });
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
      } else {
        setTickets(data || []);
      }
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "" });

    if (!formData.title || !formData.description) {
      setSubmitStatus({
        type: "error",
        message: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitStatus({
        type: "error",
        message: "Você precisa estar logado para criar um ticket.",
      });
      return;
    }

    const { data, error } = await supabase.from("tickets").insert([
      {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        department: formData.department,
        priority: formData.priority,
        status: "open", // Default status for new tickets
      },
    ]);

    if (error) {
      console.error("Error creating ticket:", error);
      setSubmitStatus({
        type: "error",
        message: "Erro ao criar o ticket. Por favor, tente novamente.",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        department: "support",
        priority: "medium",
      });
      setSubmitStatus({
        type: "success",
        message: "Ticket criado com sucesso!",
      });
      fetchTickets(); // Refresh the tickets list
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
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <DashboardSidebar />

      <main className="pt-16 pl-64">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Tickets de Suporte</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Criar Novo Ticket
                </h2>
                <form onSubmit={handleSubmit}>
                  {submitStatus.message && (
                    <div
                      className={`p-3 mb-4 rounded ${submitStatus.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  <div className="mb-4">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Título *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Departamento
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="support">Suporte Técnico</option>
                      <option value="billing">Faturamento</option>
                      <option value="sales">Vendas</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="priority"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Prioridade
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Descrição *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Enviar Ticket
                  </button>
                </form>
              </div>
            </div>

            {/* Tickets List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Meus Tickets</h2>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Você não possui tickets.</p>
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              window.location.href = `/tickets/${ticket.id}`;
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {ticket.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {ticket.description.length > 50
                                  ? `${ticket.description.substring(0, 50)}...`
                                  : ticket.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}
                              >
                                {ticket.status === "open"
                                  ? "Aberto"
                                  : ticket.status === "in_progress"
                                    ? "Em Progresso"
                                    : ticket.status === "resolved"
                                      ? "Resolvido"
                                      : "Fechado"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}
                              >
                                {ticket.priority === "high"
                                  ? "Alta"
                                  : ticket.priority === "medium"
                                    ? "Média"
                                    : "Baixa"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
