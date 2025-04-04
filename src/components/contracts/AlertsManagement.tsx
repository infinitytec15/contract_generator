"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AlertsManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const processAlerts = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("/api/contracts/process-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar alertas");
      }

      setResult(data.data);

      toast({
        title: "Alertas processados",
        description: "Os alertas de contratos foram processados com sucesso.",
      });
    } catch (err: any) {
      console.error("Erro ao processar alertas:", err);
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao processar os alertas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Gestão de Alertas de Contratos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Processe manualmente os alertas de contratos para enviar
            notificações sobre datas importantes como vencimentos, renovações e
            reajustes.
          </p>

          <Button
            onClick={processAlerts}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Processar Alertas Agora</span>
          </Button>

          {result && (
            <div className="mt-4 border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Resultado do Processamento</h3>

              {result.message ? (
                <p className="text-sm">{result.message}</p>
              ) : result.processed && result.processed.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm">
                    {result.processed.length} alertas processados:
                  </p>
                  <ul className="space-y-2">
                    {result.processed.map((item: any, index: number) => (
                      <li
                        key={index}
                        className={`text-sm p-2 rounded-md ${item.success ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}
                      >
                        <div className="flex items-start gap-2">
                          {item.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          )}
                          <div>
                            {item.success ? (
                              <>
                                <span className="font-medium">
                                  {item.contract_name}
                                </span>{" "}
                                - Cliente: {item.client_name}
                                <div className="text-xs text-gray-500 mt-1">
                                  Data de {item.date_type.replace("_date", "")}{" "}
                                  em {item.target_date} ({item.days_until} dias)
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="font-medium text-red-600">
                                  Erro no contrato {item.contract_id}
                                </span>
                                <div className="text-xs text-red-500 mt-1">
                                  {item.error}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm">Nenhum alerta processado.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
