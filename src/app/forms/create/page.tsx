import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormInput, Save, Plus, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function CreateFormPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Mock data for available contracts
  const contracts = [
    { id: "1", name: "Service Agreement - ABC Corp" },
    { id: "2", name: "NDA - XYZ Startup" },
    { id: "3", name: "Employment Contract - John Doe" },
  ];

  // Mock data for available fields
  const availableFields = [
    { id: "name", label: "Nome Completo", type: "text", required: true },
    { id: "cpf", label: "CPF", type: "text", required: true },
    { id: "email", label: "E-mail", type: "email", required: true },
    { id: "phone", label: "Telefone", type: "tel", required: false },
    { id: "cep", label: "CEP", type: "text", required: true },
    { id: "address", label: "Endereço", type: "text", required: true },
    { id: "neighborhood", label: "Bairro", type: "text", required: true },
    { id: "city", label: "Cidade", type: "text", required: true },
    { id: "state", label: "Estado", type: "text", required: true },
    {
      id: "birthdate",
      label: "Data de Nascimento",
      type: "date",
      required: false,
    },
    { id: "profession", label: "Profissão", type: "text", required: false },
  ];

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Criar Formulário</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FormInput className="h-5 w-5" />
                    <span>Campos Disponíveis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contract">Selecione o Contrato</Label>
                      <select
                        id="contract"
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Selecione um contrato...</option>
                        {contracts.map((contract) => (
                          <option key={contract.id} value={contract.id}>
                            {contract.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Campos do Formulário</Label>
                      <div className="border rounded-md divide-y">
                        {availableFields.map((field) => (
                          <div
                            key={field.id}
                            className="p-3 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`field-${field.id}`}
                                defaultChecked={field.required}
                              />
                              <Label
                                htmlFor={`field-${field.id}`}
                                className="cursor-pointer"
                              >
                                {field.label}
                              </Label>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{field.type}</span>
                              {field.required && (
                                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Campo Personalizado</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Prévia do Formulário</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="desktop">
                    <TabsList className="mb-4">
                      <TabsTrigger value="desktop">Desktop</TabsTrigger>
                      <TabsTrigger value="mobile">Mobile</TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="desktop"
                      className="border rounded-md p-6"
                    >
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="preview-name">Nome Completo</Label>
                          <Input
                            id="preview-name"
                            placeholder="Digite seu nome completo"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="preview-cpf">CPF</Label>
                            <Input
                              id="preview-cpf"
                              placeholder="000.000.000-00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="preview-email">E-mail</Label>
                            <Input
                              id="preview-email"
                              type="email"
                              placeholder="seu@email.com"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="preview-phone">Telefone</Label>
                            <Input
                              id="preview-phone"
                              placeholder="(00) 00000-0000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="preview-cep">CEP</Label>
                            <Input id="preview-cep" placeholder="00000-000" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preview-address">Endereço</Label>
                          <Input
                            id="preview-address"
                            placeholder="Rua, número"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="preview-neighborhood">Bairro</Label>
                            <Input
                              id="preview-neighborhood"
                              placeholder="Seu bairro"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="preview-city">Cidade</Label>
                            <Input id="preview-city" placeholder="Sua cidade" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="preview-state">Estado</Label>
                            <Input id="preview-state" placeholder="UF" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="mobile"
                      className="border rounded-md p-6 max-w-sm mx-auto"
                    >
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="preview-name-mobile">
                            Nome Completo
                          </Label>
                          <Input
                            id="preview-name-mobile"
                            placeholder="Digite seu nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preview-cpf-mobile">CPF</Label>
                          <Input
                            id="preview-cpf-mobile"
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preview-email-mobile">E-mail</Label>
                          <Input
                            id="preview-email-mobile"
                            type="email"
                            placeholder="seu@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preview-phone-mobile">Telefone</Label>
                          <Input
                            id="preview-phone-mobile"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preview-cep-mobile">CEP</Label>
                          <Input
                            id="preview-cep-mobile"
                            placeholder="00000-000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preview-address-mobile">
                            Endereço
                          </Label>
                          <Input
                            id="preview-address-mobile"
                            placeholder="Rua, número"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preview-neighborhood-mobile">
                            Bairro
                          </Label>
                          <Input
                            id="preview-neighborhood-mobile"
                            placeholder="Seu bairro"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preview-city-mobile">Cidade</Label>
                          <Input
                            id="preview-city-mobile"
                            placeholder="Sua cidade"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preview-state-mobile">Estado</Label>
                          <Input id="preview-state-mobile" placeholder="UF" />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-cep" />
                        <Label htmlFor="auto-cep">
                          Habilitar preenchimento automático por CEP
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" type="button">
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Salvar Formulário</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
