"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileSignature,
  CheckCircle,
  ArrowRight,
  Download,
  Loader2,
} from "lucide-react";

export default function SignaturePage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<"loading" | "signing" | "success">(
    "loading",
  );

  useEffect(() => {
    // Simulate loading the signature platform
    const timer = setTimeout(() => {
      setStatus("signing");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleCompleteSignature = () => {
    setStatus("loading");
    // Simulate signature process
    setTimeout(() => {
      setStatus("success");
    }, 2000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            Carregando plataforma de assinatura
          </h1>
          <p className="text-gray-600">Por favor, aguarde um momento...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 rounded-full p-4 w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Assinatura Concluída com Sucesso!
          </h1>
          <p className="text-gray-600 mb-8">
            Seu contrato foi assinado digitalmente e está pronto para download.
          </p>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Contrato:</span>
                  <span className="text-sm">
                    Contrato de Prestação de Serviços
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Número:</span>
                  <span className="text-sm">{params.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Data de Assinatura:
                  </span>
                  <span className="text-sm">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hora:</span>
                  <span className="text-sm">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Hash de Verificação:
                  </span>
                  <span className="text-sm text-gray-500 truncate w-48">
                    a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              <span>Baixar Contrato Assinado</span>
            </Button>

            <Button variant="outline" className="w-full">
              Voltar para a página inicial
            </Button>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Uma cópia deste contrato foi enviada para seu e-mail.</p>
            <p className="mt-4">
              © {new Date().getFullYear()} ContractFlow. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <FileSignature className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Assinatura Digital</h1>
          <p className="text-gray-600 mt-2">
            Siga as instruções abaixo para assinar seu contrato
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="bg-white border rounded-lg p-8 min-h-[500px]">
              {/* Mock signature platform interface */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold">
                  Plataforma de Assinatura Digital
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Contrato de Prestação de Serviços - Nº {params.id}
                </p>
              </div>

              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">
                    Instruções para Assinatura
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Verifique se seus dados estão corretos no contrato</li>
                    <li>Clique no botão "Assinar Digitalmente" abaixo</li>
                    <li>Confirme sua identidade através do método escolhido</li>
                    <li>Aguarde a confirmação da assinatura</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Dados do Signatário</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nome:</p>
                      <p className="font-medium">João da Silva</p>
                    </div>
                    <div>
                      <p className="text-gray-500">CPF:</p>
                      <p className="font-medium">123.456.789-00</p>
                    </div>
                    <div>
                      <p className="text-gray-500">E-mail:</p>
                      <p className="font-medium">joao.silva@example.com</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Data:</p>
                      <p className="font-medium">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-medium mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    <span>Declaração de Consentimento</span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ao clicar em "Assinar Digitalmente", declaro que li e
                    concordo com os termos do contrato e reconheço que minha
                    assinatura digital tem o mesmo valor jurídico de uma
                    assinatura física, conforme previsto na Lei 14.063/2020 (Lei
                    das Assinaturas Eletrônicas).
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleCompleteSignature}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2 px-8 py-6"
                >
                  <FileSignature className="h-5 w-5" />
                  <span className="text-lg">Assinar Digitalmente</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} ContractFlow. Todos os direitos
            reservados.
          </p>
          <p className="mt-1">
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>{" "}
            |
            <a href="#" className="text-blue-600 hover:underline ml-2">
              Termos de Uso
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
