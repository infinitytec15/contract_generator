import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileUpload,
  Upload,
  Tag,
  Save,
  Calendar,
  Bell,
  Plus,
  Trash2,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { uploadContractTemplateAction } from "@/app/actions";

export default async function AddContractPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Adicionar Contrato</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={uploadContractTemplateAction}
                method="post"
                encType="multipart/form-data"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Contrato</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Contrato de Prestação de Serviços"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select name="category" required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">
                          Prestação de Serviços
                        </SelectItem>
                        <SelectItem value="nda">
                          Confidencialidade (NDA)
                        </SelectItem>
                        <SelectItem value="employment">
                          Contrato de Trabalho
                        </SelectItem>
                        <SelectItem value="rental">
                          Contrato de Aluguel
                        </SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Ramo de Atividade</Label>
                    <Select name="branch">
                      <SelectTrigger id="branch">
                        <SelectValue placeholder="Selecione um ramo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corporate">Corporativo</SelectItem>
                        <SelectItem value="legal">Jurídico</SelectItem>
                        <SelectItem value="hr">Recursos Humanos</SelectItem>
                        <SelectItem value="real-estate">Imobiliário</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue="active">
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva o propósito deste contrato..."
                    rows={3}
                  />
                </div>

                <div className="p-6 border border-dashed rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                  <FileUpload className="h-12 w-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">
                    Arraste e solte seu arquivo aqui
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Suporta PDF ou DOCX (máx. 10MB)
                  </p>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Selecionar Arquivo</span>
                  </Button>
                  <p id="file-name" className="mt-2 text-sm text-gray-500"></p>
                  <script
                    dangerouslySetInnerHTML={{
                      __html: `
                    document.getElementById('file').addEventListener('change', function(e) {
                      const fileName = e.target.files[0]?.name || 'Nenhum arquivo selecionado';
                      document.getElementById('file-name').textContent = fileName;
                    });
                  `,
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Gestão de Prazos</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="effective_date">
                        Data de Início de Vigência
                      </Label>
                      <Input
                        id="effective_date"
                        name="effective_date"
                        type="date"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="termination_date">
                        Data de Término de Vigência
                      </Label>
                      <Input
                        id="termination_date"
                        name="termination_date"
                        type="date"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="renewal_date">Data de Renovação</Label>
                      <Input
                        id="renewal_date"
                        name="renewal_date"
                        type="date"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adjustment_date">Data de Reajuste</Label>
                      <Input
                        id="adjustment_date"
                        name="adjustment_date"
                        type="date"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Configuração de Alertas</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="alert_days_before">
                        Dias de Antecedência para Alertas
                      </Label>
                      <Input
                        id="alert_days_before"
                        name="alert_days_before"
                        type="number"
                        min="1"
                        max="90"
                        defaultValue="7"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipos de Alertas</Label>
                      <div className="flex flex-col gap-2 pt-2">
                        <div className="flex items-center gap-2">
                          <Input
                            id="alert_email"
                            name="alert_email"
                            type="checkbox"
                            className="h-4 w-4"
                            defaultChecked
                          />
                          <Label
                            htmlFor="alert_email"
                            className="text-sm font-normal"
                          >
                            Email
                          </Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            id="alert_sms"
                            name="alert_sms"
                            type="checkbox"
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor="alert_sms"
                            className="text-sm font-normal"
                          >
                            SMS
                          </Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            id="alert_system"
                            name="alert_system"
                            type="checkbox"
                            className="h-4 w-4"
                            defaultChecked
                          />
                          <Label
                            htmlFor="alert_system"
                            className="text-sm font-normal"
                          >
                            Notificação no Sistema
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>Campos Dinâmicos</span>
                  </Label>
                  <div className="space-y-4" id="dynamic-fields">
                    <p className="text-sm text-gray-500">
                      Defina os campos dinâmicos que serão substituídos no seu
                      modelo. Use o formato {"{{nome_campo}}"} no seu documento.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        name="field_names[0]"
                        placeholder="Nome do campo (ex: nome_cliente)"
                        className="flex-1"
                      />
                      <Input
                        name="field_labels[0]"
                        placeholder="Rótulo de exibição (ex: Nome do Cliente)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 flex items-center gap-2"
                      onClick={() => {
                        const container =
                          document.getElementById("dynamic-fields");
                        const fieldCount =
                          container?.querySelectorAll(
                            ".flex.items-center.gap-2",
                          ).length || 0;
                        const newField = document.createElement("div");
                        newField.className = "flex items-center gap-2";
                        newField.innerHTML = `
                          <input name="field_names[${fieldCount}]" placeholder="Nome do campo (ex: nome_cliente)" class="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                          <input name="field_labels[${fieldCount}]" placeholder="Rótulo de exibição (ex: Nome do Cliente)" class="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                          <button type="button" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 w-9 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                          </button>
                        `;
                        container?.appendChild(newField);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Campo</span>
                    </Button>
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
                    <span>Salvar Contrato</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
