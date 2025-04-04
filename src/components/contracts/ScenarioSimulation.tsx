"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface ScenarioSimulationProps {
  contractId: string;
  contractName?: string;
}

interface ContractData {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  value: number;
  currency: string;
  payment_frequency: string;
  adjustment_index: string;
  adjustment_percentage: number;
  penalty_percentage: number;
}

export default function ScenarioSimulation({
  contractId,
  contractName = "Contrato",
}: ScenarioSimulationProps) {
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Renewal simulation state
  const [renewalPeriod, setRenewalPeriod] = useState(12); // months
  const [adjustmentIndex, setAdjustmentIndex] = useState("IPCA");
  const [adjustmentRate, setAdjustmentRate] = useState(4.5); // %
  const [renewalResults, setRenewalResults] = useState<any>(null);

  // Termination simulation state
  const [terminationDate, setTerminationDate] = useState("");
  const [remainingMonths, setRemainingMonths] = useState(0);
  const [penaltyRate, setPenaltyRate] = useState(20); // %
  const [terminationResults, setTerminationResults] = useState<any>(null);

  // Economic indices data (mock)
  const indices = {
    IPCA: { current: 4.5, last12Months: 4.23, forecast: 4.1 },
    IGPM: { current: 6.2, last12Months: 5.78, forecast: 5.9 },
    INPC: { current: 4.3, last12Months: 4.1, forecast: 4.0 },
    SELIC: { current: 10.5, last12Months: 11.2, forecast: 10.0 },
  };

  useEffect(() => {
    fetchContractData();
  }, [contractId]);

  const fetchContractData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // Get contract data
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // For demo purposes, let's create some mock data if needed
      const mockContract: ContractData = {
        id: contractId,
        name: data?.name || contractName,
        start_date:
          data?.start_date ||
          new Date(
            new Date().setMonth(new Date().getMonth() - 6),
          ).toISOString(),
        end_date:
          data?.end_date ||
          new Date(
            new Date().setMonth(new Date().getMonth() + 6),
          ).toISOString(),
        value: data?.value || 5000,
        currency: data?.currency || "BRL",
        payment_frequency: data?.payment_frequency || "monthly",
        adjustment_index: data?.adjustment_index || "IPCA",
        adjustment_percentage: data?.adjustment_percentage || 100,
        penalty_percentage: data?.penalty_percentage || 20,
      };

      setContract(mockContract);

      // Set default termination date to today
      setTerminationDate(new Date().toISOString().split("T")[0]);

      // Set default adjustment index from contract
      if (mockContract.adjustment_index) {
        setAdjustmentIndex(mockContract.adjustment_index);
      }

      // Set default penalty rate from contract
      if (mockContract.penalty_percentage) {
        setPenaltyRate(mockContract.penalty_percentage);
      }

      // Calculate remaining months
      calculateRemainingMonths(
        new Date().toISOString().split("T")[0],
        mockContract.end_date,
      );
    } catch (err: any) {
      console.error("Error fetching contract data:", err);
      setError(err.message || "Erro ao carregar dados do contrato");
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingMonths = (currentDate: string, endDate: string) => {
    const end = new Date(endDate);
    const current = new Date(currentDate);

    // Calculate difference in months
    const months =
      (end.getFullYear() - current.getFullYear()) * 12 +
      (end.getMonth() - current.getMonth());

    setRemainingMonths(Math.max(0, months));
  };

  const simulateRenewal = () => {
    if (!contract) return;

    const currentValue = contract.value;
    const adjustedValue = currentValue * (1 + adjustmentRate / 100);
    const totalValue = adjustedValue * renewalPeriod;

    // Calculate new end date
    const currentEndDate = new Date(contract.end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(currentEndDate.getMonth() + renewalPeriod);

    setRenewalResults({
      currentValue,
      adjustedValue,
      totalValue,
      currentEndDate: currentEndDate.toISOString().split("T")[0],
      newEndDate: newEndDate.toISOString().split("T")[0],
      adjustmentRate,
      adjustmentIndex,
      renewalPeriod,
      difference: adjustedValue - currentValue,
      percentageIncrease: ((adjustedValue - currentValue) / currentValue) * 100,
    });
  };

  const simulateTermination = () => {
    if (!contract) return;

    // Calculate remaining value
    const monthlyValue = contract.value;
    const remainingValue = monthlyValue * remainingMonths;

    // Calculate penalty
    const penaltyValue = remainingValue * (penaltyRate / 100);

    // Calculate total cost
    const totalCost = penaltyValue;

    setTerminationResults({
      terminationDate,
      remainingMonths,
      monthlyValue,
      remainingValue,
      penaltyRate,
      penaltyValue,
      totalCost,
      savingsIfContinued: remainingValue - totalCost,
    });
  };

  const handleTerminationDateChange = (date: string) => {
    setTerminationDate(date);
    if (contract) {
      calculateRemainingMonths(date, contract.end_date);
    }
  };

  // Format currency
  const formatCurrency = (value: number, currency = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          <span>Simulação de Cenários</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="renewal">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="renewal">Renovação</TabsTrigger>
              <TabsTrigger value="termination">Rescisão</TabsTrigger>
            </TabsList>

            {/* Renewal Simulation Tab */}
            <TabsContent value="renewal" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="renewalPeriod">
                      Período de Renovação (meses)
                    </Label>
                    <Input
                      id="renewalPeriod"
                      type="number"
                      value={renewalPeriod}
                      onChange={(e) =>
                        setRenewalPeriod(parseInt(e.target.value) || 12)
                      }
                      min="1"
                      max="60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adjustmentIndex">Índice de Reajuste</Label>
                    <Select
                      value={adjustmentIndex}
                      onValueChange={setAdjustmentIndex}
                    >
                      <SelectTrigger id="adjustmentIndex">
                        <SelectValue placeholder="Selecione o índice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IPCA">IPCA</SelectItem>
                        <SelectItem value="IGPM">IGPM</SelectItem>
                        <SelectItem value="INPC">INPC</SelectItem>
                        <SelectItem value="SELIC">SELIC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adjustmentRate">Taxa de Reajuste (%)</Label>
                    <Input
                      id="adjustmentRate"
                      type="number"
                      value={adjustmentRate}
                      onChange={(e) =>
                        setAdjustmentRate(parseFloat(e.target.value) || 0)
                      }
                      step="0.1"
                      min="0"
                      max="30"
                    />
                  </div>

                  <div className="pt-4">
                    <Button onClick={simulateRenewal} className="w-full">
                      Simular Renovação
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">
                    Índices Econômicos Atuais
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(indices).map(([name, data]) => (
                      <div
                        key={name}
                        className="flex justify-between items-center"
                      >
                        <span className="font-medium">{name}:</span>
                        <div className="text-right">
                          <p className="text-sm">
                            Atual:{" "}
                            <span className="font-medium">{data.current}%</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Últimos 12 meses: {data.last12Months}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {renewalResults && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>Resultados da Simulação</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Valores
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Valor Atual:</span>
                            <span className="font-medium">
                              {formatCurrency(renewalResults.currentValue)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor Reajustado:</span>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(renewalResults.adjustedValue)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Diferença:</span>
                            <span className="font-medium text-green-600">
                              +{formatCurrency(renewalResults.difference)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Aumento Percentual:</span>
                            <span className="font-medium">
                              {renewalResults.percentageIncrease.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Datas
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Término Atual:</span>
                            <span className="font-medium">
                              {new Date(
                                renewalResults.currentEndDate,
                              ).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Novo Término:</span>
                            <span className="font-medium text-blue-600">
                              {new Date(
                                renewalResults.newEndDate,
                              ).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Detalhes da Renovação
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Período de Renovação:</span>
                            <span className="font-medium">
                              {renewalResults.renewalPeriod} meses
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Índice de Reajuste:</span>
                            <span className="font-medium">
                              {renewalResults.adjustmentIndex}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxa de Reajuste:</span>
                            <span className="font-medium">
                              {renewalResults.adjustmentRate}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Valor Total do Contrato
                        </h4>
                        <div className="text-center py-4">
                          <p className="text-3xl font-bold text-blue-600">
                            {formatCurrency(renewalResults.totalValue)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Para o período de {renewalResults.renewalPeriod}{" "}
                            meses
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Termination Simulation Tab */}
            <TabsContent value="termination" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="terminationDate">Data de Rescisão</Label>
                    <Input
                      id="terminationDate"
                      type="date"
                      value={terminationDate}
                      onChange={(e) =>
                        handleTerminationDateChange(e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remainingMonths">Meses Restantes</Label>
                    <Input
                      id="remainingMonths"
                      type="number"
                      value={remainingMonths}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="penaltyRate">Taxa de Multa (%)</Label>
                    <Input
                      id="penaltyRate"
                      type="number"
                      value={penaltyRate}
                      onChange={(e) =>
                        setPenaltyRate(parseFloat(e.target.value) || 0)
                      }
                      step="1"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="pt-4">
                    <Button onClick={simulateTermination} className="w-full">
                      Simular Rescisão
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Informações do Contrato</h3>
                  {contract && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Valor Mensal:</span>
                        <span className="font-medium">
                          {formatCurrency(contract.value)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Data de Início:</span>
                        <span className="font-medium">
                          {new Date(contract.start_date).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Data de Término:</span>
                        <span className="font-medium">
                          {new Date(contract.end_date).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Multa Contratual:</span>
                        <span className="font-medium">
                          {contract.penalty_percentage}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {terminationResults && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span>Resultados da Simulação</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Valores Remanescentes
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Valor Mensal:</span>
                            <span className="font-medium">
                              {formatCurrency(terminationResults.monthlyValue)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Meses Restantes:</span>
                            <span className="font-medium">
                              {terminationResults.remainingMonths}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor Remanescente:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                terminationResults.remainingValue,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Multa por Rescisão
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Taxa de Multa:</span>
                            <span className="font-medium">
                              {terminationResults.penaltyRate}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor da Multa:</span>
                            <span className="font-medium text-red-600">
                              {formatCurrency(terminationResults.penaltyValue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Detalhes da Rescisão
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Data de Rescisão:</span>
                            <span className="font-medium">
                              {new Date(
                                terminationResults.terminationDate,
                              ).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Economia se Continuar:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(
                                terminationResults.savingsIfContinued,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Custo Total da Rescisão
                        </h4>
                        <div className="text-center py-4">
                          <p className="text-3xl font-bold text-red-600">
                            {formatCurrency(terminationResults.totalCost)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Valor a ser pago para rescindir o contrato
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
