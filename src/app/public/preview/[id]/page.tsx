"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSignature, ArrowRight, Download, Loader2 } from "lucide-react";

export default function ContractPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(false);

  const handleSignContract = () => {
    setLoading(true);
    // Simulate redirect to signature platform
    setTimeout(() => {
      window.location.href = `/public/signature/${params.id}`;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <FileSignature className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Prévia do Contrato</h1>
          <p className="text-gray-600 mt-2">
            Revise o documento antes de prosseguir para assinatura
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="bg-white border rounded-lg p-8 min-h-[600px] shadow-sm">
              {/* Mock contract content */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold uppercase">
                  CONTRATO DE PRESTAÇÃO DE SERVIÇOS
                </h2>
                <p className="text-sm text-gray-500 mt-2">Nº {params.id}</p>
              </div>

              <div className="space-y-4 text-sm">
                <p>
                  <strong>CONTRATANTE:</strong> João da Silva, brasileiro,
                  portador do CPF nº 123.456.789-00, residente e domiciliado na
                  Rua das Flores, 123, Bairro Centro, Cidade São Paulo, Estado
                  SP, CEP 01234-567.
                </p>

                <p>
                  <strong>CONTRATADA:</strong> ABC Serviços Ltda., pessoa
                  jurídica de direito privado, inscrita no CNPJ sob o nº
                  12.345.678/0001-90, com sede na Avenida Paulista, 1000, Bairro
                  Bela Vista, Cidade São Paulo, Estado SP, CEP 01310-100, neste
                  ato representada por seu sócio administrador, Sr. José Santos.
                </p>

                <p>
                  As partes acima identificadas têm, entre si, justo e acertado
                  o presente Contrato de Prestação de Serviços, que se regerá
                  pelas cláusulas seguintes e pelas condições descritas no
                  presente.
                </p>

                <h3 className="font-bold mt-6">
                  CLÁUSULA PRIMEIRA - DO OBJETO
                </h3>
                <p>
                  O presente contrato tem como objeto a prestação de serviços de
                  consultoria em tecnologia da informação pela CONTRATADA ao
                  CONTRATANTE, conforme especificações detalhadas no Anexo I
                  deste contrato.
                </p>

                <h3 className="font-bold mt-6">
                  CLÁUSULA SEGUNDA - DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO
                </h3>
                <p>
                  Pela prestação dos serviços, o CONTRATANTE pagará à CONTRATADA
                  o valor total de R$ 10.000,00 (dez mil reais), a ser pago em 2
                  (duas) parcelas iguais de R$ 5.000,00 (cinco mil reais), com
                  vencimento no dia 10 de cada mês.
                </p>

                <h3 className="font-bold mt-6">CLÁUSULA TERCEIRA - DO PRAZO</h3>
                <p>
                  O presente contrato terá vigência de 3 (três) meses,
                  iniciando-se na data de sua assinatura, podendo ser prorrogado
                  mediante acordo entre as partes.
                </p>

                <h3 className="font-bold mt-6">
                  CLÁUSULA QUARTA - DAS OBRIGAÇÕES
                </h3>
                <p>
                  A CONTRATADA se compromete a executar os serviços com
                  qualidade e dentro dos prazos estabelecidos, enquanto o
                  CONTRATANTE se compromete a fornecer todas as informações
                  necessárias para a execução dos serviços.
                </p>

                <div className="mt-8 pt-8 border-t">
                  <p className="text-center">
                    São Paulo, {new Date().toLocaleDateString()}
                  </p>

                  <div className="flex justify-between mt-12">
                    <div className="text-center">
                      <div className="border-t border-black pt-2 w-48 mx-auto">
                        <p>CONTRATANTE</p>
                        <p>João da Silva</p>
                        <p>CPF: 123.456.789-00</p>
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Baixar PDF</span>
          </Button>

          <Button
            onClick={handleSignContract}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecionando...</span>
              </>
            ) : (
              <>
                <span>Revisar e Assinar</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

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
