import { useState } from "react";
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
import { formatCurrency } from "./calendar-events";
import { TrendingUp, TrendingDown, Clock, Calendar } from "lucide-react";

export interface ContractData {
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

interface RenewalSimulationProps {
  contract: ContractData;
  onSimulate: (results: any) => void;
}

export function RenewalSimulation({
  contract,
  onSimulate,
}: RenewalSimulationProps) {
  const [renewalPeriod, setRenewalPeriod] = useState(12); // months
  const [adjustmentIndex, setAdjustmentIndex] = useState(
    contract.adjustment_index || "IPCA",
  );
  const [adjustmentRate, setAdjustmentRate] = useState(4.5); // %

  // Economic indices data (mock)
  const indices = {
    IPCA: { current: 4.5, last12Months: 4.23, forecast: 4.1 },
    IGPM: { current: 6.2, last12Months: 5.78, forecast: 5.9 },
    INPC: { current: 4.3, last12Months: 4.1, forecast: 4.0 },
    SELIC: { current: 10.5, last12Months: 11.2, forecast: 10.0 },
  };

  const simulateRenewal = () => {
    const currentValue = contract.value;
    const adjustedValue = currentValue * (1 + adjustmentRate / 100);
    const totalValue = adjustedValue * renewalPeriod;

    // Calculate new end date
    const currentEndDate = new Date(contract.end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(currentEndDate.getMonth() + renewalPeriod);

    const results = {
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
    };

    onSimulate(results);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="renewalPeriod">Período de Renovação (meses)</Label>
            <Input
              id="renewalPeriod"
              type="number"
              value={renewalPeriod}
              onChange={(e) => setRenewalPeriod(parseInt(e.target.value) || 12)}
              min="1"
              max="60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustmentIndex">Índice de Reajuste</Label>
            <Select value={adjustmentIndex} onValueChange={setAdjustmentIndex}>
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
          <h3 className="font-medium mb-3">Índices Econômicos Atuais</h3>
          <div className="space-y-3">
            {Object.entries(indices).map(([name, data]) => (
              <div key={name} className="flex justify-between items-center">
                <span className="font-medium">{name}:</span>
                <div className="text-right">
                  <p className="text-sm">
                    Atual: <span className="font-medium">{data.current}%</span>
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
    </div>
  );
}

interface TerminationSimulationProps {
  contract: ContractData;
  onSimulate: (results: any) => void;
}

export function TerminationSimulation({
  contract,
  onSimulate,
}: TerminationSimulationProps) {
  const [terminationDate, setTerminationDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [remainingMonths, setRemainingMonths] = useState(0);
  const [penaltyRate, setPenaltyRate] = useState(
    contract.penalty_percentage || 20,
  ); // %

  // Calculate remaining months when component mounts or termination date changes
  const calculateRemainingMonths = (currentDate: string, endDate: string) => {
    const end = new Date(endDate);
    const current = new Date(currentDate);

    // Calculate difference in months
    const months =
      (end.getFullYear() - current.getFullYear()) * 12 +
      (end.getMonth() - current.getMonth());

    return Math.max(0, months);
  };

  const handleTerminationDateChange = (date: string) => {
    setTerminationDate(date);
    const months = calculateRemainingMonths(date, contract.end_date);
    setRemainingMonths(months);
  };

  // Initialize remaining months
  useState(() => {
    handleTerminationDateChange(terminationDate);
  });

  const simulateTermination = () => {
    // Calculate remaining value
    const monthlyValue = contract.value;
    const remainingValue = monthlyValue * remainingMonths;

    // Calculate penalty
    const penaltyValue = remainingValue * (penaltyRate / 100);

    // Calculate total cost
    const totalCost = penaltyValue;

    const results = {
      terminationDate,
      remainingMonths,
      monthlyValue,
      remainingValue,
      penaltyRate,
      penaltyValue,
      totalCost,
      savingsIfContinued: remainingValue - totalCost,
    };

    onSimulate(results);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terminationDate">Data de Rescisão</Label>
            <Input
              id="terminationDate"
              type="date"
              value={terminationDate}
              onChange={(e) => handleTerminationDateChange(e.target.value)}
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
              onChange={(e) => setPenaltyRate(parseFloat(e.target.value) || 0)}
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
                {new Date(contract.start_date).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Data de Término:</span>
              <span className="font-medium">
                {new Date(contract.end_date).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Multa Contratual:</span>
              <span className="font-medium">
                {contract.penalty_percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RenewalResults({ results }: { results: any }) {
  if (!results) return null;

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <span>Resultados da Simulação</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Valores</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Valor Atual:</span>
                <span className="font-medium">
                  {formatCurrency(results.currentValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Valor Reajustado:</span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(results.adjustedValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Diferença:</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(results.difference)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Aumento Percentual:</span>
                <span className="font-medium">
                  {results.percentageIncrease.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Datas</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Término Atual:</span>
                <span className="font-medium">
                  {new Date(results.currentEndDate).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Novo Término:</span>
                <span className="font-medium text-blue-600">
                  {new Date(results.newEndDate).toLocaleDateString("pt-BR")}
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
                  {results.renewalPeriod} meses
                </span>
              </div>
              <div className="flex justify-between">
                <span>Índice de Reajuste:</span>
                <span className="font-medium">{results.adjustmentIndex}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Reajuste:</span>
                <span className="font-medium">{results.adjustmentRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Valor Total do Contrato
            </h4>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(results.totalValue)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Para o período de {results.renewalPeriod} meses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TerminationResults({ results }: { results: any }) {
  if (!results) return null;

  return (
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
                  {formatCurrency(results.monthlyValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Meses Restantes:</span>
                <span className="font-medium">{results.remainingMonths}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Remanescente:</span>
                <span className="font-medium">
                  {formatCurrency(results.remainingValue)}
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
                <span className="font-medium">{results.penaltyRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Valor da Multa:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(results.penaltyValue)}
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
                  {new Date(results.terminationDate).toLocaleDateString(
                    "pt-BR",
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Economia se Continuar:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(results.savingsIfContinued)}
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
                {formatCurrency(results.totalCost)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Valor a ser pago para rescindir o contrato
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
