"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  FileText,
  User,
  Building,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import SignatureButton from "./SignatureButton";
import SignatureStatus from "./SignatureStatus";

interface ContractDetailsProps {
  contractId: string;
}

export default function ContractDetails({ contractId }: ContractDetailsProps) {
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchContractAndUser = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Obter dados do usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Obter dados do perfil do usuário
        const { data: userProfile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        setUserData(userProfile);

        // Obter dados do contrato
        const { data, error } = await supabase
          .from("contracts")
          .select("*, clients(*), contract_templates(*)")
          .eq("id", contractId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setContract(data);
      } catch (err: any) {
        console.error("Error fetching contract:", err);
        setError(err.message || "Erro ao carregar detalhes do contrato");
      } finally {
        setLoading(false);
      }
    };

    fetchContractAndUser();
  }, [contractId, router]);

  const handleRefresh = () => {
    // Recarregar os dados do contrato
    const fetchContract = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from("contracts")
          .select("*, clients(*), contract_templates(*)")
          .eq("id", contractId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setContract(data);
      } catch (err: any) {
        console.error("Error refreshing contract:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error || "Contrato não encontrado"}
        </div>
        <Button
          onClick={() => router.push("/contracts")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Contratos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/contracts")}
            className="mb-2 flex items-center gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Contratos
          </Button>
          <h1 className="text-2xl font-bold">{contract.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge
              className={`${contract.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {contract.status === "active" ? "Ativo" : "Inativo"}
            </Badge>

            {/* Status de assinatura */}
            <SignatureStatus
              contractId={contractId}
              initialStatus={contract.signature_status}
            />

            <span className="text-sm text-gray-500">ID: {contract.id}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Botão de visualização */}
          <Button
            variant="outline"
            onClick={() => window.open(contract.file_url, "_blank")}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>

          {/* Botão de download */}
          <Button
            variant="outline"
            onClick={() => window.open(contract.file_url, "_blank")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>

          {/* Botão de assinatura */}
          <SignatureButton
            contractId={contractId}
            status={contract.signature_status}
            userName={userData?.full_name}
            onSuccess={handleRefresh}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <dt className="text-sm font-medium text-gray-500">Modelo:</dt>
                <dd className="text-sm">
                  {contract.contract_templates?.name || "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  Categoria:
                </dt>
                <dd className="text-sm">
                  {contract.contract_templates?.category || "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  Criado em:
                </dt>
                <dd className="text-sm">{formatDate(contract.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  Última atualização:
                </dt>
                <dd className="text-sm">{formatDate(contract.updated_at)}</dd>
              </div>

              {/* Datas de Gestão de Prazos */}
              {contract.signature_date && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Data de Assinatura:
                  </dt>
                  <dd className="text-sm">
                    {formatDate(contract.signature_date)}
                  </dd>
                </div>
              )}
              {contract.effective_date && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Início de Vigência:
                  </dt>
                  <dd className="text-sm">
                    {formatDate(contract.effective_date)}
                  </dd>
                </div>
              )}
              {contract.termination_date && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Término de Vigência:
                  </dt>
                  <dd className="text-sm">
                    {formatDate(contract.termination_date)}
                  </dd>
                </div>
              )}
              {contract.renewal_date && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Data de Renovação:
                  </dt>
                  <dd className="text-sm">
                    {formatDate(contract.renewal_date)}
                  </dd>
                </div>
              )}
              {contract.adjustment_date && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Data de Reajuste:
                  </dt>
                  <dd className="text-sm">
                    {formatDate(contract.adjustment_date)}
                  </dd>
                </div>
              )}

              {/* Informações de assinatura */}
              {contract.signature_status && (
                <div className="pt-2 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Status da Assinatura
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Status:
                      </dt>
                      <dd className="text-sm">
                        <SignatureStatus
                          contractId={contractId}
                          initialStatus={contract.signature_status}
                        />
                      </dd>
                    </div>

                    {contract.signed_file_url && (
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Documento Assinado:
                        </dt>
                        <dd className="text-sm">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600"
                            onClick={() =>
                              window.open(contract.signed_file_url, "_blank")
                            }
                          >
                            Visualizar
                          </Button>
                        </dd>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <span>Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">{contract.clients?.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Email:</span>{" "}
                  {contract.clients?.email}
                </p>
                {contract.clients?.phone && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Telefone:</span>{" "}
                    {contract.clients?.phone}
                  </p>
                )}
                {contract.clients?.document && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Documento:</span>{" "}
                    {contract.clients?.document}
                  </p>
                )}
                {contract.clients?.address && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Endereço:</span>{" "}
                    {contract.clients?.address}
                    {contract.clients?.city && contract.clients?.state
                      ? `, ${contract.clients.city} - ${contract.clients.state}`
                      : ""}
                    {contract.clients?.postal_code
                      ? `, ${contract.clients.postal_code}`
                      : ""}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Histórico</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-2 border-gray-200 pl-4 py-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Criado em:</span>{" "}
                  {formatDate(contract.created_at)}
                </p>
              </div>

              {contract.signature_status && (
                <div className="border-l-2 border-gray-200 pl-4 py-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">
                      Enviado para assinatura:
                    </span>{" "}
                    {formatDate(contract.updated_at)}
                  </p>
                </div>
              )}

              {contract.signature_status === "signed" &&
                contract.signed_file_url && (
                  <div className="border-l-2 border-gray-200 pl-4 py-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Assinado:</span>{" "}
                      {formatDate(contract.updated_at)}
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {contract.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>Descrição</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="whitespace-pre-wrap">{contract.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
