"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FormMessage from "@/components/form-message";
import {
  ArrowLeft,
  Pencil,
  Ban,
  UserCheck,
  CreditCard,
  Clock,
  User,
  MapPin,
  FileText,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

type Client = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  status: string;
  payment_status: string;
  plan_id: string | null;
  last_login: string | null;
  last_ip: string | null;
  is_blocked: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  plans?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    billing_cycle: string;
  } | null;
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_cycle: string;
};

type LoginHistory = {
  id: string;
  client_id: string;
  ip_address: string;
  user_agent: string | null;
  login_at: string;
};

type Payment = {
  id: string;
  client_id: string;
  plan_id: string | null;
  amount: number;
  payment_date: string | null;
  due_date: string | null;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
  plans?: {
    name: string;
  } | null;
};

type ClientDetailsProps = {
  client: Client;
  isAdmin?: boolean;
  userId?: string;
};

export default function ClientDetails({
  client,
  isAdmin = false,
  userId = "",
}: ClientDetailsProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);

  // Form states
  const [editClientName, setEditClientName] = useState("");
  const [editClientEmail, setEditClientEmail] = useState("");
  const [editClientPhone, setEditClientPhone] = useState("");
  const [editClientDocument, setEditClientDocument] = useState("");
  const [editClientAddress, setEditClientAddress] = useState("");
  const [editClientCity, setEditClientCity] = useState("");
  const [editClientState, setEditClientState] = useState("");
  const [editClientPostalCode, setEditClientPostalCode] = useState("");
  const [editClientStatus, setEditClientStatus] = useState("");
  const [editClientPaymentStatus, setEditClientPaymentStatus] = useState("");
  const [editClientPlanId, setEditClientPlanId] = useState<string>("");
  const [editClientNotes, setEditClientNotes] = useState("");

  // New payment form states
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDueDate, setNewPaymentDueDate] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("pending");

  // New plan change states
  const [newPlanId, setNewPlanId] = useState<string>("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
    fetchLoginHistory();
    fetchPayments();

    // Set form values
    if (client) {
      setEditClientName(client.name);
      setEditClientEmail(client.email);
      setEditClientPhone(client.phone || "");
      setEditClientDocument(client.document || "");
      setEditClientAddress(client.address || "");
      setEditClientCity(client.city || "");
      setEditClientState(client.state || "");
      setEditClientPostalCode(client.postal_code || "");
      setEditClientStatus(client.status);
      setEditClientPaymentStatus(client.payment_status);
      setEditClientPlanId(client.plan_id || "");
      setNewPlanId(client.plan_id || "");
      setEditClientNotes(client.notes || "");
      setLoading(false);
    }
  }, [client]);

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

  const fetchLoginHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("client_login_history")
        .select("*")
        .eq("client_id", client.id)
        .order("login_at", { ascending: false });

      if (error) throw error;
      setLoginHistory(data || []);
    } catch (error: any) {
      console.error("Error fetching login history:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("client_payments")
        .select(
          `
          *,
          plans:plan_id (name)
        `,
        )
        .eq("client_id", client.id)
        .order("due_date", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
    }
  };

  const handleUpdateClient = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!editClientName || !editClientEmail) {
        setError("Nome e email são obrigatórios");
        return;
      }

      // Update client
      const { error } = await supabase
        .from("clients")
        .update({
          name: editClientName,
          email: editClientEmail,
          phone: editClientPhone || null,
          document: editClientDocument || null,
          address: editClientAddress || null,
          city: editClientCity || null,
          state: editClientState || null,
          postal_code: editClientPostalCode || null,
          status: editClientStatus,
          payment_status: editClientPaymentStatus,
          plan_id: editClientPlanId || null,
          notes: editClientNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", client.id);

      if (error) throw error;

      setSuccess("Cliente atualizado com sucesso");
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      setError(error.message);
      console.error("Error updating client:", error);
    }
  };

  const handleChangePlan = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Update client plan
      const { error } = await supabase
        .from("clients")
        .update({
          plan_id: newPlanId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", client.id);

      if (error) throw error;

      // If a new plan is selected, create a payment record
      if (newPlanId) {
        const selectedPlan = plans.find((p) => p.id === newPlanId);
        if (selectedPlan) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + 1);

          const { error: paymentError } = await supabase
            .from("client_payments")
            .insert({
              client_id: client.id,
              plan_id: newPlanId,
              amount: selectedPlan.price,
              due_date: dueDate.toISOString(),
              status: "pending",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (paymentError) throw paymentError;
        }
      }

      setSuccess("Plano atualizado com sucesso");
      setIsChangePlanDialogOpen(false);
      router.refresh();
      fetchPayments();
    } catch (error: any) {
      setError(error.message);
      console.error("Error changing plan:", error);
    }
  };

  const handleBlockClient = async (block: boolean) => {
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
      router.refresh();
    } catch (error: any) {
      setError(error.message);
      console.error("Error updating client block status:", error);
    }
  };

  const handleAddPayment = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!newPaymentAmount || !newPaymentDueDate) {
        setError("Valor e data de vencimento são obrigatórios");
        return;
      }

      const amount = parseFloat(newPaymentAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Valor inválido");
        return;
      }

      // Create payment
      const { error } = await supabase.from("client_payments").insert({
        client_id: client.id,
        plan_id: client.plan_id || null,
        amount,
        due_date: new Date(newPaymentDueDate).toISOString(),
        status: newPaymentStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccess("Pagamento adicionado com sucesso");
      setIsAddPaymentDialogOpen(false);
      resetPaymentForm();
      fetchPayments();
    } catch (error: any) {
      setError(error.message);
      console.error("Error adding payment:", error);
    }
  };

  const handleUpdatePaymentStatus = async (
    paymentId: string,
    status: string,
  ) => {
    try {
      setError(null);
      setSuccess(null);

      // Update payment status
      const { error } = await supabase
        .from("client_payments")
        .update({
          status,
          payment_date: status === "paid" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (error) throw error;

      // If payment is marked as paid or overdue, update client payment status
      if (status === "paid" || status === "overdue") {
        const { error: clientError } = await supabase
          .from("clients")
          .update({
            payment_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", client.id);

        if (clientError) throw clientError;
      }

      setSuccess("Status do pagamento atualizado com sucesso");
      fetchPayments();
      router.refresh();
    } catch (error: any) {
      setError(error.message);
      console.error("Error updating payment status:", error);
    }
  };

  const resetPaymentForm = () => {
    setNewPaymentAmount("");
    setNewPaymentDueDate("");
    setNewPaymentStatus("pending");
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

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return "Mensal";
      case "quarterly":
        return "Trimestral";
      case "semiannual":
        return "Semestral";
      case "annual":
        return "Anual";
      default:
        return cycle;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando detalhes do cliente...</CardTitle>
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
      {error && <FormMessage type="error" message={error} className="mb-4" />}
      {success && (
        <FormMessage type="success" message={success} className="mb-4" />
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          {client.is_blocked && (
            <Badge
              variant="outline"
              className="bg-red-100 text-red-800 border-red-200"
            >
              Bloqueado
            </Badge>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant={client.is_blocked ? "outline" : "destructive"}
              onClick={() => handleBlockClient(!client.is_blocked)}
            >
              {client.is_blocked ? (
                <>
                  <UserCheck className="mr-2 h-4 w-4" /> Desbloquear
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4" /> Bloquear
                </>
              )}
            </Button>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status da Conta:</span>
                <Badge
                  variant="outline"
                  className={getStatusBadgeColor(client.status)}
                >
                  {getStatusLabel(client.status)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Status de Pagamento:
                </span>
                <Badge
                  variant="outline"
                  className={getPaymentStatusBadgeColor(client.payment_status)}
                >
                  {getPaymentStatusLabel(client.payment_status)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Bloqueado:</span>
                <Badge
                  variant="outline"
                  className={
                    client.is_blocked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }
                >
                  {client.is_blocked ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.plans ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Nome:</span>
                  <span>{client.plans.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valor:</span>
                  <span>R$ {client.plans.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ciclo:</span>
                  <span>
                    {getBillingCycleLabel(client.plans.billing_cycle)}
                  </span>
                </div>
                {client.plans.description && (
                  <div className="pt-2">
                    <span className="text-sm font-medium">Descrição:</span>
                    <p className="text-sm mt-1">{client.plans.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">Sem plano atribuído</p>
              </div>
            )}
          </CardContent>
          {isAdmin && (
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setNewPlanId(client.plan_id || "");
                  setIsChangePlanDialogOpen(true);
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {client.plans ? "Alterar Plano" : "Atribuir Plano"}
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{client.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Telefone:</span>
                <span className="text-sm">
                  {client.phone || "Não informado"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Documento:</span>
                <span className="text-sm">
                  {client.document || "Não informado"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Último Login:</span>
                <span className="text-sm">
                  {client.last_login
                    ? new Date(client.last_login).toLocaleDateString()
                    : "Nunca"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Plan Dialog */}
      {isAdmin && (
        <Dialog
          open={isChangePlanDialogOpen}
          onOpenChange={setIsChangePlanDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {client.plans ? "Alterar Plano" : "Atribuir Plano"}
              </DialogTitle>
              <DialogDescription>
                Selecione um plano para este cliente. Um novo registro de
                pagamento será criado automaticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="planSelect">Plano</Label>
                  <Select value={newPlanId} onValueChange={setNewPlanId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem plano</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - R$ {plan.price.toFixed(2)}/
                          {plan.billing_cycle === "monthly"
                            ? "mês"
                            : plan.billing_cycle === "annual"
                              ? "ano"
                              : plan.billing_cycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newPlanId && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h3 className="font-medium text-sm">
                      Detalhes do Plano Selecionado
                    </h3>
                    {(() => {
                      const selectedPlan = plans.find(
                        (p) => p.id === newPlanId,
                      );
                      if (!selectedPlan) return null;

                      return (
                        <div className="mt-2 space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Nome:</span>{" "}
                            {selectedPlan.name}
                          </p>
                          <p>
                            <span className="font-medium">Valor:</span> R${" "}
                            {selectedPlan.price.toFixed(2)}
                          </p>
                          <p>
                            <span className="font-medium">Ciclo:</span>{" "}
                            {getBillingCycleLabel(selectedPlan.billing_cycle)}
                          </p>
                          {selectedPlan.description && (
                            <p>
                              <span className="font-medium">Descrição:</span>{" "}
                              {selectedPlan.description}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsChangePlanDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleChangePlan}>
                {client.plans ? "Alterar Plano" : "Atribuir Plano"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add more sections as needed */}
    </>
  );
}
