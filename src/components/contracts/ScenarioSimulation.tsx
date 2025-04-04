"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3 } from "lucide-react";

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
        start_date: data?.start_date || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
        end_date: data?.end_date || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
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
      calculateRemainingMonths(new Date().toISOString().split("T")[0], mockContract.end_date);
      
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
    const months = (end.getFullYear() - current.getFullYear()) * 12 + 
                  (end.getMonth() - current.getMonth());
    
    setRemainingMonths(Math.max(0, months));
  };

  const simulateRenewal = () => {
    if (!contract) return;
    
    const currentValue = contract.value;
    const adjustedValue = currentValue * (1 + (adjustmentRate / 100));
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
