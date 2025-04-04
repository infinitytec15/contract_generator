"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, CreditCard } from "lucide-react";
import FormMessage from "@/components/form-message";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_cycle: string;
  features: Record<string, boolean>;
  contract_uploads_limit: number;
  client_limit: number;
  contract_links_limit: number;
  signature_limit: number;
  is_active: boolean;
  created_at: string;
};

const availableFeatures = [
  { id: "support", label: "Suporte Prioritário" },
  { id: "analytics", label: "Análises Avançadas" },
  { id: "api_access", label: "Acesso à API" },
  { id: "custom_branding", label: "Personalização de Marca" },
  { id: "multiple_users", label: "Múltiplos Usuários" },
  { id: "export_data", label: "Exportação de Dados" },
];

export default function PlanManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Form states
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDescription, setNewPlanDescription] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [newPlanBillingCycle, setNewPlanBillingCycle] = useState("monthly");
  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<string, boolean>
  >({});
  const [newContractUploadsLimit, setNewContractUploadsLimit] = useState("");
  const [newClientLimit, setNewClientLimit] = useState("");
  const [newContractLinksLimit, setNewContractLinksLimit] = useState("");
  const [newSignatureLimit, setNewSignatureLimit] = useState("");
  const [newPlanIsActive, setNewPlanIsActive] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price");

      if (error) throw error;
      setPlans(data);
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!newPlanName || !newPlanPrice || !newPlanBillingCycle) {
        setError("Nome, preço e ciclo de cobrança são obrigatórios");
        return;
      }

      const price = parseFloat(newPlanPrice);
      if (isNaN(price) || price < 0) {
        setError("Preço inválido");
        return;
      }

      // Create plan
      const { error } = await supabase.from("plans").insert({
        name: newPlanName,
        description: newPlanDescription || null,
        price,
        billing_cycle: newPlanBillingCycle,
        features: selectedFeatures,
        contract_uploads_limit: newContractUploadsLimit
          ? parseInt(newContractUploadsLimit)
          : 10,
        client_limit: newClientLimit ? parseInt(newClientLimit) : 10,
        contract_links_limit: newContractLinksLimit
          ? parseInt(newContractLinksLimit)
          : 20,
        signature_limit: newSignatureLimit ? parseInt(newSignatureLimit) : 20,
        is_active: newPlanIsActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccess("Plano criado com sucesso");
      setIsAddDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      setError(error.message);
      console.error("Error adding plan:", error);
    }
  };

  const handleEditPlan = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!selectedPlan) return;

      if (!newPlanName || !newPlanPrice || !newPlanBillingCycle) {
        setError("Nome, preço e ciclo de cobrança são obrigatórios");
        return;
      }

      const price = parseFloat(newPlanPrice);
      if (isNaN(price) || price < 0) {
        setError("Preço inválido");
        return;
      }

      // Update plan
      const { error } = await supabase
        .from("plans")
        .update({
          name: newPlanName,
          description: newPlanDescription || null,
          price,
          billing_cycle: newPlanBillingCycle,
          features: selectedFeatures,
          contract_uploads_limit: newContractUploadsLimit
            ? parseInt(newContractUploadsLimit)
            : 10,
          client_limit: newClientLimit ? parseInt(newClientLimit) : 10,
          contract_links_limit: newContractLinksLimit
            ? parseInt(newContractLinksLimit)
            : 20,
          signature_limit: newSignatureLimit ? parseInt(newSignatureLimit) : 20,
          is_active: newPlanIsActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPlan.id);

      if (error) throw error;

      setSuccess("Plano atualizado com sucesso");
      setIsEditDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      setError(error.message);
      console.error("Error updating plan:", error);
    }
  };

  const handleDeletePlan = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!selectedPlan) return;

      // Check if plan is assigned to any clients
      const { data: planClients, error: checkError } = await supabase
        .from("clients")
        .select("id")
        .eq("plan_id", selectedPlan.id);

      if (checkError) throw checkError;

      if (planClients && planClients.length > 0) {
        setError(
          `Este plano está atribuído a ${planClients.length} cliente(s) e não pode ser excluído`,
        );
        return;
      }

      // Delete plan
      const { error } = await supabase
        .from("plans")
        .delete()
        .eq("id", selectedPlan.id);

      if (error) throw error;

      setSuccess("Plano excluído com sucesso");
      setIsDeleteDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      setError(error.message);
      console.error("Error deleting plan:", error);
    }
  };

  const openEditDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setNewPlanName(plan.name);
    setNewPlanDescription(plan.description || "");
    setNewPlanPrice(plan.price.toString());
    setNewPlanBillingCycle(plan.billing_cycle);
    setSelectedFeatures(plan.features || {});
    setNewContractUploadsLimit(plan.contract_uploads_limit.toString());
    setNewClientLimit(plan.client_limit.toString());
    setNewContractLinksLimit(plan.contract_links_limit.toString());
    setNewSignatureLimit(plan.signature_limit.toString());
    setNewPlanIsActive(plan.is_active);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewPlanName("");
    setNewPlanDescription("");
    setNewPlanPrice("");
    setNewPlanBillingCycle("monthly");
    setSelectedFeatures({});
    setNewContractUploadsLimit("10");
    setNewClientLimit("10");
    setNewContractLinksLimit("20");
    setNewSignatureLimit("20");
    setNewPlanIsActive(true);
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [featureId]: !prev[featureId],
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
          <CardTitle>Carregando planos...</CardTitle>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos</CardTitle>
            <CardDescription>
              Gerencie os planos de assinatura do sistema
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Adicionar Plano</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Plano</DialogTitle>
                <DialogDescription>
                  Defina os detalhes e limites do novo plano
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Nome do Plano *</Label>
                  <Input
                    id="planName"
                    placeholder="Nome do plano"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planPrice">Preço *</Label>
                  <Input
                    id="planPrice"
                    placeholder="0.00"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planBillingCycle">Ciclo de Cobrança *</Label>
                  <Select
                    value={newPlanBillingCycle}
                    onValueChange={setNewPlanBillingCycle}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ciclo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="semiannual">Semestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planIsActive">Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="planIsActive"
                      checked={newPlanIsActive}
                      onCheckedChange={(checked) =>
                        setNewPlanIsActive(checked as boolean)
                      }
                    />
                    <Label htmlFor="planIsActive">Plano Ativo</Label>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="planDescription">Descrição</Label>
                  <Textarea
                    id="planDescription"
                    placeholder="Descrição do plano"
                    value={newPlanDescription}
                    onChange={(e) => setNewPlanDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractUploadsLimit">
                    Limite de Contratos
                  </Label>
                  <Input
                    id="contractUploadsLimit"
                    type="number"
                    placeholder="10"
                    value={newContractUploadsLimit}
                    onChange={(e) => setNewContractUploadsLimit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientLimit">Limite de Clientes</Label>
                  <Input
                    id="clientLimit"
                    type="number"
                    placeholder="10"
                    value={newClientLimit}
                    onChange={(e) => setNewClientLimit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractLinksLimit">Limite de Links</Label>
                  <Input
                    id="contractLinksLimit"
                    type="number"
                    placeholder="20"
                    value={newContractLinksLimit}
                    onChange={(e) => setNewContractLinksLimit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signatureLimit">Limite de Assinaturas</Label>
                  <Input
                    id="signatureLimit"
                    type="number"
                    placeholder="20"
                    value={newSignatureLimit}
                    onChange={(e) => setNewSignatureLimit(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Recursos Incluídos</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-3">
                    {availableFeatures.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`feature-${feature.id}`}
                          checked={!!selectedFeatures[feature.id]}
                          onCheckedChange={() =>
                            handleFeatureToggle(feature.id)
                          }
                        />
                        <Label htmlFor={`feature-${feature.id}`}>
                          {feature.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddPlan}>Adicionar Plano</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ciclo</TableHead>
                <TableHead>Limites</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-4 text-gray-500"
                  >
                    Nenhum plano encontrado
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{formatCurrency(plan.price)}</TableCell>
                    <TableCell>
                      {getBillingCycleLabel(plan.billing_cycle)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Contratos: {plan.contract_uploads_limit}</div>
                        <div>Clientes: {plan.client_limit}</div>
                        <div>Links: {plan.contract_links_limit}</div>
                        <div>Assinaturas: {plan.signature_limit}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          plan.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {plan.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(plan.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(plan)}
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
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Atualize os detalhes e limites do plano
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editPlanName">Nome do Plano *</Label>
              <Input
                id="editPlanName"
                placeholder="Nome do plano"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPlanPrice">Preço *</Label>
              <Input
                id="editPlanPrice"
                placeholder="0.00"
                value={newPlanPrice}
                onChange={(e) => setNewPlanPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPlanBillingCycle">Ciclo de Cobrança *</Label>
              <Select
                value={newPlanBillingCycle}
                onValueChange={setNewPlanBillingCycle}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ciclo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="semiannual">Semestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPlanIsActive">Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="editPlanIsActive"
                  checked={newPlanIsActive}
                  onCheckedChange={(checked) =>
                    setNewPlanIsActive(checked as boolean)
                  }
                />
                <Label htmlFor="editPlanIsActive">Plano Ativo</Label>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="editPlanDescription">Descrição</Label>
              <Textarea
                id="editPlanDescription"
                placeholder="Descrição do plano"
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editContractUploadsLimit">
                Limite de Contratos
              </Label>
              <Input
                id="editContractUploadsLimit"
                type="number"
                placeholder="10"
                value={newContractUploadsLimit}
                onChange={(e) => setNewContractUploadsLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editClientLimit">Limite de Clientes</Label>
              <Input
                id="editClientLimit"
                type="number"
                placeholder="10"
                value={newClientLimit}
                onChange={(e) => setNewClientLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editContractLinksLimit">Limite de Links</Label>
              <Input
                id="editContractLinksLimit"
                type="number"
                placeholder="20"
                value={newContractLinksLimit}
                onChange={(e) => setNewContractLinksLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSignatureLimit">Limite de Assinaturas</Label>
              <Input
                id="editSignatureLimit"
                type="number"
                placeholder="20"
                value={newSignatureLimit}
                onChange={(e) => setNewSignatureLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Recursos Incluídos</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-3">
                {availableFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-feature-${feature.id}`}
                      checked={!!selectedFeatures[feature.id]}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                    <Label htmlFor={`edit-feature-${feature.id}`}>
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditPlan}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Plano</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este plano? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPlan && (
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong> {selectedPlan.name}
                </p>
                <p>
                  <strong>Preço:</strong> {formatCurrency(selectedPlan.price)}
                </p>
                <p>
                  <strong>Ciclo:</strong>{" "}
                  {getBillingCycleLabel(selectedPlan.billing_cycle)}
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
            <Button variant="destructive" onClick={handleDeletePlan}>
              Excluir Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
