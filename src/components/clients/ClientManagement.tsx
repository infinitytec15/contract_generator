"use client";

import FormMessage from "@/components/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Ban,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";
import { ClientChart } from "./ClientChart";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  status: string;
  payment_status: string;
  last_login: string | null;
  last_ip: string | null;
  is_blocked: boolean;
  created_at: string;
  plan?: {
    name: string;
    price: number;
  } | null;
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_cycle: string;
};

type ClientManagementProps = {
  isAdmin: boolean;
  userId: string;
};

export default function ClientManagement({
  isAdmin,
  userId,
}: ClientManagementProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  // Form states
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientDocument, setNewClientDocument] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientCity, setNewClientCity] = useState("");
  const [newClientState, setNewClientState] = useState("");
  const [newClientPostalCode, setNewClientPostalCode] = useState("");
  const [newClientPlanId, setNewClientPlanId] = useState<string>("");
  const [newClientNotes, setNewClientNotes] = useState("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchClients();
    fetchPlans();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);

      let query = supabase.from("clients").select(`
          *,
          plans:plan_id (name, price)
        `);

      // If not admin, only show own clients
      if (!isAdmin) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price");

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleAddClient = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!newClientName || !newClientEmail) {
        setError("Nome e email são obrigatórios");
        return;
      }

      // Create client
      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: userId,
          name: newClientName,
          email: newClientEmail,
          phone: newClientPhone || null,
          document: newClientDocument || null,
          address: newClientAddress || null,
          city: newClientCity || null,
          state: newClientState || null,
          postal_code: newClientPostalCode || null,
          plan_id: newClientPlanId || null,
          notes: newClientNotes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // If plan is selected, create initial payment record
      if (newClientPlanId) {
        const selectedPlan = plans.find((p) => p.id === newClientPlanId);
        if (selectedPlan) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + 1);

          const { error: paymentError } = await supabase
            .from("client_payments")
            .insert({
              client_id: data.id,
              plan_id: newClientPlanId,
              amount: selectedPlan.price,
              due_date: dueDate.toISOString(),
              status: "pending",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (paymentError) throw paymentError;
        }
      }

      setSuccess("Cliente adicionado com sucesso");
      setIsAddDialogOpen(false);
      resetForm();
      fetchClients();
    } catch (error: any) {
      setError(error.message);
      console.error("Error adding client:", error);
    }
  };

  const handleDeleteClient = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!selectedClient) return;

      // Delete client
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", selectedClient.id);

      if (error) throw error;

      setSuccess("Cliente excluído com sucesso");
      setIsDeleteDialogOpen(false);
      fetchClients();
    } catch (error: any) {
      setError(error.message);
      console.error("Error deleting client:", error);
    }
  };

  const handleBlockClient = async (client: Client, block: boolean) => {
    try {
      setError(null);
      setSuccess(null);

      // Update client block status
      const { error } = await supabase
        .from("clients")
        .update({
          is_blocked: block,
          updated_at: new Date().toISOString(),
        })
        .eq("id", client.id);

      if (error) throw error;

      setSuccess(`Cliente ${block ? "bloqueado" : "desbloqueado"} com sucesso`);
      fetchClients();
    } catch (error: any) {
      setError(error.message);
      console.error("Error updating client block status:", error);
    }
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientDocument("");
    setNewClientAddress("");
    setNewClientCity("");
    setNewClientState("");
    setNewClientPostalCode("");
    setNewClientPlanId("");
    setNewClientNotes("");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "suspended":
        return "Suspenso";
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Inadimplente";
      default:
        return status;
    }
  };

  const filteredClients = clients.filter((client) => {
    // Text search
    const matchesSearch =
      searchTerm === "" ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.document &&
        client.document.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    // Payment status filter
    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      client.payment_status === paymentStatusFilter;

    // Plan filter
    const matchesPlan =
      planFilter === "all" ||
      (planFilter === "no_plan" && !client.plan_id) ||
      client.plan_id === planFilter;

    // Tab filter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && client.status === "active") ||
      (activeTab === "inactive" && client.status === "inactive") ||
      (activeTab === "overdue" && client.payment_status === "overdue") ||
      (activeTab === "blocked" && client.is_blocked);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPaymentStatus &&
      matchesPlan &&
      matchesTab
    );
  });

  const exportToCSV = () => {
    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "Documento",
      "Status",
      "Status de Pagamento",
      "Plano",
      "Último Login",
      "IP",
      "Criado em",
    ];

    const csvData = filteredClients.map((client) => [
      client.name,
      client.email,
      client.phone || "",
      client.document || "",
      getStatusLabel(client.status),
      getPaymentStatusLabel(client.payment_status),
      client.plan?.name || "Sem plano",
      client.last_login
        ? new Date(client.last_login).toLocaleString()
        : "Nunca",
      client.last_ip || "",
      new Date(client.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `clientes_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando clientes...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {error && <FormMessage message={{ error }} className="mb-4" />}
      {success && <FormMessage message={{ success }} className="mb-4" />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clients.length}</div>
            <p className="text-sm text-gray-500 mt-1">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {clients.filter((c) => c.status === "active").length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {Math.round(
                (clients.filter((c) => c.status === "active").length /
                  clients.length) *
                  100
              ) || 0}
              % do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inadimplentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {clients.filter((c) => c.payment_status === "overdue").length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {Math.round(
                (clients.filter((c) => c.payment_status === "overdue").length /
                  clients.length) *
                  100
              ) || 0}
              % do total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Distribuição de Clientes</CardTitle>
          <CardDescription>Visualização por status e pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ClientChart clients={clients} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Gerencie os clientes do sistema</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Adicionar Cliente</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo cliente
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome completo"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">CPF/CNPJ</Label>
                  <Input
                    id="document"
                    placeholder="000.000.000-00"
                    value={newClientDocument}
                    onChange={(e) => setNewClientDocument(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Rua, número"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={newClientCity}
                    onChange={(e) => setNewClientCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    placeholder="UF"
                    value={newClientState}
                    onChange={(e) => setNewClientState(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">CEP</Label>
                  <Input
                    id="postalCode"
                    placeholder="00000-000"
                    value={newClientPostalCode}
                    onChange={(e) => setNewClientPostalCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="plan">Plano</Label>
                  <Select
                    value={newClientPlanId}
                    onValueChange={setNewClientPlanId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem plano</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - R$ {plan.price.toFixed(2)}/
                          {plan.billing_cycle === "monthly" ? "mês" : "ano"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre o cliente"
                    value={newClientNotes}
                    onChange={(e) => setNewClientNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddClient}>Adicionar Cliente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="active">Ativos</TabsTrigger>
                  <TabsTrigger value="inactive">Inativos</TabsTrigger>
                  <TabsTrigger value="overdue">Inadimplentes</TabsTrigger>
                  <TabsTrigger value="blocked">Bloqueados</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar cliente..."
                      className="pl-9 w-full sm:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={exportToCSV}
                    title="Exportar para CSV"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchClients}
                    title="Atualizar"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Status:</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">Pagamento:</span>
                  <Select
                    value={paymentStatusFilter}
                    onValueChange={setPaymentStatusFilter}
                  >
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="overdue">Inadimplente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">Plano:</span>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="h-8 w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os planos</SelectItem>
                      <SelectItem value="no_plan">Sem plano</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="all" className="m-0">
                <ClientsTable
                  clients={filteredClients}
                  getStatusBadgeColor={getStatusBadgeColor}
                  getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
                  getStatusLabel={getStatusLabel}
                  getPaymentStatusLabel={getPaymentStatusLabel}
                  onView={(client) => router.push(`/clients/${client.id}`)}
                  onDelete={openDeleteDialog}
                  onBlock={(client) =>
                    handleBlockClient(client, !client.is_blocked)
                  }
                />
              </TabsContent>

              <TabsContent value="active" className="m-0">
                <ClientsTable
                  clients={filteredClients}
                  getStatusBadgeColor={getStatusBadgeColor}
                  getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
                  getStatusLabel={getStatusLabel}
                  getPaymentStatusLabel={getPaymentStatusLabel}
                  onView={(client) => router.push(`/clients/${client.id}`)}
                  onDelete={openDeleteDialog}
                  onBlock={(client) =>
                    handleBlockClient(client, !client.is_blocked)
                  }
                />
              </TabsContent>

              <TabsContent value="inactive" className="m-0">
                <ClientsTable
                  clients={filteredClients}
                  getStatusBadgeColor={getStatusBadgeColor}
                  getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
                  getStatusLabel={getStatusLabel}
                  getPaymentStatusLabel={getPaymentStatusLabel}
                  onView={(client) => router.push(`/clients/${client.id}`)}
                  onDelete={openDeleteDialog}
                  onBlock={(client) =>
                    handleBlockClient(client, !client.is_blocked)
                  }
                />
              </TabsContent>

              <TabsContent value="overdue" className="m-0">
                <ClientsTable
                  clients={filteredClients}
                  getStatusBadgeColor={getStatusBadgeColor}
                  getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
                  getStatusLabel={getStatusLabel}
                  getPaymentStatusLabel={getPaymentStatusLabel}
                  onView={(client) => router.push(`/clients/${client.id}`)}
                  onDelete={openDeleteDialog}
                  onBlock={(client) =>
                    handleBlockClient(client, !client.is_blocked)
                  }
                />
              </TabsContent>

              <TabsContent value="blocked" className="m-0">
                <ClientsTable
                  clients={filteredClients}
                  getStatusBadgeColor={getStatusBadgeColor}
                  getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
                  getStatusLabel={getStatusLabel}
                  getPaymentStatusLabel={getPaymentStatusLabel}
                  onView={(client) => router.push(`/clients/${client.id}`)}
                  onDelete={openDeleteDialog}
                  onBlock={(client) =>
                    handleBlockClient(client, !client.is_blocked)
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedClient && (
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong> {selectedClient.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedClient.email}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Excluir Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type ClientsTableProps = {
  clients: Client[];
  getStatusBadgeColor: (status: string) => string;
  getPaymentStatusBadgeColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getPaymentStatusLabel: (status: string) => string;
  onView: (client: Client) => void;
  onDelete: (client: Client) => void;
  onBlock: (client: Client) => void;
};

function ClientsTable({
  clients,
  getStatusBadgeColor,
  getPaymentStatusBadgeColor,
  getStatusLabel,
  getPaymentStatusLabel,
  onView,
  onDelete,
  onBlock,
}: ClientsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Último Login</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                Nenhum cliente encontrado
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow
                key={client.id}
                className={client.is_blocked ? "bg-gray-50" : ""}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeColor(client.status)}
                  >
                    {getStatusLabel(client.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getPaymentStatusBadgeColor(
                      client.payment_status
                    )}
                  >
                    {getPaymentStatusLabel(client.payment_status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {client.plan ? (
                    <span className="text-sm">
                      {client.plan.name}{" "}
                      <span className="text-gray-500">
                        (R$ {client.plan.price.toFixed(2)})
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Sem plano</span>
                  )}
                </TableCell>
                <TableCell>
                  {client.last_login ? (
                    <div className="text-sm">
                      <div>
                        {new Date(client.last_login).toLocaleDateString()}
                      </div>
                      {client.last_ip && (
                        <div className="text-xs text-gray-500">
                          {client.last_ip}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Nunca</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(client)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onBlock(client)}
                      title={client.is_blocked ? "Desbloquear" : "Bloquear"}
                    >
                      {client.is_blocked ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <Ban className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(client)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
