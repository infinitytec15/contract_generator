"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Calendar, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AlertSettingsProps {
  contractId: string;
}

export default function AlertSettings({ contractId }: AlertSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertSettings, setAlertSettings] = useState<any>({
    alert_days_before: 7,
    alert_email: true,
    alert_sms: false,
    alert_system: true,
    effective_date: null,
    termination_date: null,
    renewal_date: null,
    adjustment_date: null,
  });

  useEffect(() => {
    const fetchAlertSettings = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Buscar configurações de alerta para este contrato
        const { data, error } = await supabase
          .from("contract_alerts")
          .select("*")
          .eq("contract_id", contractId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 é o código para "nenhum resultado encontrado"
          console.error("Erro ao buscar configurações de alerta:", error);
          return;
        }

        // Se encontrou configurações, atualizar o estado
        if (data) {
          setAlertSettings({
            alert_days_before: data.alert_days_before || 7,
            alert_email: data.alert_email,
            alert_sms: data.alert_sms,
            alert_system: data.alert_system,
            effective_date: data.effective_date,
            termination_date: data.termination_date,
            renewal_date: data.renewal_date,
            adjustment_date: data.adjustment_date,
          });
        }

        // Se não encontrou configurações, buscar datas do contrato
        else {
          const { data: contractData, error: contractError } = await supabase
            .from("contracts")
            .select(
              "effective_date, termination_date, renewal_date, adjustment_date",
            )
            .eq("id", contractId)
            .single();

          if (contractError) {
            console.error("Erro ao buscar dados do contrato:", contractError);
            return;
          }

          if (contractData) {
            setAlertSettings({
              ...alertSettings,
              effective_date: contractData.effective_date,
              termination_date: contractData.termination_date,
              renewal_date: contractData.renewal_date,
              adjustment_date: contractData.adjustment_date,
            });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar configurações de alerta:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertSettings();
  }, [contractId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAlertSettings({
      ...alertSettings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Preparar dados para envio
      const payload = {
        contract_id: contractId,
        alert_days_before: parseInt(alertSettings.alert_days_before) || 7,
        alert_email: alertSettings.alert_email,
        alert_sms: alertSettings.alert_sms,
        alert_system: alertSettings.alert_system,
        effective_date: alertSettings.effective_date,
        termination_date: alertSettings.termination_date,
        renewal_date: alertSettings.renewal_date,
        adjustment_date: alertSettings.adjustment_date,
      };

      // Enviar para a API
      const response = await fetch("/api/contracts/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar configurações");
      }

      toast({
        title: "Configurações salvas",
        description:
          "As configurações de alerta foram atualizadas com sucesso.",
      });
    } catch (err: any) {
      console.error("Erro ao salvar configurações:", err);
      toast({
        title: "Erro",
        description:
          err.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; // Formato YYYY-MM-DD para input date
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>Configurações de Alerta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Configurações de Alerta</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
                  value={formatDate(alertSettings.effective_date)}
                  onChange={handleInputChange}
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
                  value={formatDate(alertSettings.termination_date)}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="renewal_date">Data de Renovação</Label>
                <Input
                  id="renewal_date"
                  name="renewal_date"
                  type="date"
                  value={formatDate(alertSettings.renewal_date)}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment_date">Data de Reajuste</Label>
                <Input
                  id="adjustment_date"
                  name="adjustment_date"
                  type="date"
                  value={formatDate(alertSettings.adjustment_date)}
                  onChange={handleInputChange}
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
                  value={alertSettings.alert_days_before}
                  onChange={handleInputChange}
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
                      checked={alertSettings.alert_email}
                      onChange={handleInputChange}
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
                      checked={alertSettings.alert_sms}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="alert_sms" className="text-sm font-normal">
                      SMS
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      id="alert_system"
                      name="alert_system"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={alertSettings.alert_system}
                      onChange={handleInputChange}
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

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Salvar Configurações</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
