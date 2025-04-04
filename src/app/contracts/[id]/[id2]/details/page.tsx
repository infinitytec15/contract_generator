import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  ExternalLink,
  Mail,
  Clock,
  User,
  MapPin,
  FileSignature,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../../supabase/server";

export default async function ContractDetailsPage({
  params,
}: {
  params: { id: string; id2: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Mock contract data
  const contract = {
    id: params.id2,
    name: "Service Agreement - ABC Corp",
    category: "Service Agreement",
    branch: "Corporate",
    createdAt: "2023-10-15",
    status: "signed",
    clientData: {
      name: "João da Silva",
      email: "joao.silva@example.com",
      cpf: "123.456.789-00",
      phone: "(11) 98765-4321",
      address: "Rua das Flores, 123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      cep: "01234-567",
    },
    link: "https://contractflow.com/form/abc123",
    signatureLogs: [
      {
        action: "Link gerado",
        date: "2023-10-15T10:30:00",
        ip: "192.168.1.1",
      },
      {
        action: "Formulário preenchido",
        date: "2023-10-16T14:45:00",
        ip: "187.45.67.89",
      },
      {
        action: "Contrato assinado",
        date: "2023-10-16T15:20:00",
        ip: "187.45.67.89",
        hash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
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
            <div>
              <h1 className="text-2xl font-semibold">{contract.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`${
                    contract.status === "signed"
                      ? "bg-green-100 text-green-800"
                      : contract.status === "pending"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {contract.status === "signed"
                    ? "Assinado"
                    : contract.status === "pending"
                      ? "Pendente"
                      : "Rascunho"}
                </Badge>
                <span className="text-sm text-gray-500">ID: {contract.id}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Baixar PDF</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Enviar por E-mail</span>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="client">Dados do Cliente</TabsTrigger>
              <TabsTrigger value="logs">Logs de Assinatura</TabsTrigger>
              <TabsTrigger value="preview">Prévia do Contrato</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span>Informações do Contrato</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Nome:
                        </dt>
                        <dd className="text-sm">{contract.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Categoria:
                        </dt>
                        <dd className="text-sm">{contract.category}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Ramo:
                        </dt>
                        <dd className="text-sm">{contract.branch}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Data de Criação:
                        </dt>
                        <dd className="text-sm">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Status:
                        </dt>
                        <dd className="text-sm">
                          <Badge
                            variant="outline"
                            className={`${
                              contract.status === "signed"
                                ? "bg-green-100 text-green-800"
                                : contract.status === "pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {contract.status === "signed"
                              ? "Assinado"
                              : contract.status === "pending"
                                ? "Pendente"
                                : "Rascunho"}
                          </Badge>
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      <span>Link de Acesso</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={contract.link}
                          readOnly
                          className="w-full p-2 text-sm bg-gray-50 border rounded-md"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Enviar Link</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Abrir Link</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="client">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Dados do Cliente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">
                          Informações Pessoais
                        </h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm">
                            <span className="font-medium">Nome:</span>{" "}
                            {contract.clientData.name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">CPF:</span>{" "}
                            {contract.clientData.cpf}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">E-mail:</span>{" "}
                            {contract.clientData.email}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Telefone:</span>{" "}
                            {contract.clientData.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">
                          Endereço
                        </h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm">
                            <span className="font-medium">CEP:</span>{" "}
                            {contract.clientData.cep}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Endereço:</span>{" "}
                            {contract.clientData.address}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Bairro:</span>{" "}
                            {contract.clientData.neighborhood}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Cidade:</span>{" "}
                            {contract.clientData.city}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Estado:</span>{" "}
                            {contract.clientData.state}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>Logs de Assinatura</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <ul className="space-y-6 relative">
                      {contract.signatureLogs.map((log, index) => (
                        <li key={index} className="ml-8 relative">
                          <div className="absolute -left-10 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 border border-blue-200">
                            {index === 2 ? (
                              <FileSignature className="h-3 w-3 text-blue-600" />
                            ) : index === 1 ? (
                              <User className="h-3 w-3 text-blue-600" />
                            ) : (
                              <ExternalLink className="h-3 w-3 text-blue-600" />
                            )}
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{log.action}</h3>
                              <span className="text-xs text-gray-500">
                                {new Date(log.date).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              <p>IP: {log.ip}</p>
                              {log.hash && (
                                <p className="mt-1">Hash: {log.hash}</p>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>Prévia do Contrato</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-8 min-h-[600px] shadow-sm">
                    {/* Mock contract content */}
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-bold uppercase">
                        CONTRATO DE PRESTAÇÃO DE SERVIÇOS
                      </h2>
                      <p className="text-sm text-gray-500 mt-2">
                        Nº {contract.id}
                      </p>
                    </div>

                    <div className="space-y-4 text-sm">
                      <p>
                        <strong>CONTRATANTE:</strong> {contract.clientData.name}
                        , brasileiro, portador do CPF nº{" "}
                        {contract.clientData.cpf}, residente e domiciliado na{" "}
                        {contract.clientData.address}, Bairro{" "}
                        {contract.clientData.neighborhood}, Cidade{" "}
                        {contract.clientData.city}, Estado{" "}
                        {contract.clientData.state}, CEP{" "}
                        {contract.clientData.cep}.
                      </p>

                      <p>
                        <strong>CONTRATADA:</strong> ABC Serviços Ltda., pessoa
                        jurídica de direito privado, inscrita no CNPJ sob o nº
                        12.345.678/0001-90, com sede na Avenida Paulista, 1000,
                        Bairro Bela Vista, Cidade São Paulo, Estado SP, CEP
                        01310-100, neste ato representada por seu sócio
                        administrador, Sr. José Santos.
                      </p>

                      <p>
                        As partes acima identificadas têm, entre si, justo e
                        acertado o presente Contrato de Prestação de Serviços,
                        que se regerá pelas cláusulas seguintes e pelas
                        condições descritas no presente.
                      </p>

                      <h3 className="font-bold mt-6">
                        CLÁUSULA PRIMEIRA - DO OBJETO
                      </h3>
                      <p>
                        O presente contrato tem como objeto a prestação de
                        serviços de consultoria em tecnologia da informação pela
                        CONTRATADA ao CONTRATANTE, conforme especificações
                        detalhadas no Anexo I deste contrato.
                      </p>

                      <h3 className="font-bold mt-6">
                        CLÁUSULA SEGUNDA - DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO
                      </h3>
                      <p>
                        Pela prestação dos serviços, o CONTRATANTE pagará à
                        CONTRATADA o valor total de R$ 10.000,00 (dez mil
                        reais), a ser pago em 2 (duas) parcelas iguais de R$
                        5.000,00 (cinco mil reais), com vencimento no dia 10 de
                        cada mês.
                      </p>

                      <h3 className="font-bold mt-6">
                        CLÁUSULA TERCEIRA - DO PRAZO
                      </h3>
                      <p>
                        O presente contrato terá vigência de 3 (três) meses,
                        iniciando-se na data de sua assinatura, podendo ser
                        prorrogado mediante acordo entre as partes.
                      </p>

                      <div className="mt-8 pt-8 border-t">
                        <p className="text-center">
                          São Paulo,{" "}
                          {new Date(
                            contract.signatureLogs[2].date,
                          ).toLocaleDateString()}
                        </p>

                        <div className="flex justify-between mt-12">
                          <div className="text-center">
                            <div className="border-t border-black pt-2 w-48 mx-auto">
                              <p>CONTRATANTE</p>
                              <p>{contract.clientData.name}</p>
                              <p>CPF: {contract.clientData.cpf}</p>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="border-t border-black pt-2 w-48 mx-auto">
                              <p>CONTRATADA</p>
                              <p>ABC Serviços Ltda.</p>
                              <p>CNPJ: 12.345.678/0001-90</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}

function Copy({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
