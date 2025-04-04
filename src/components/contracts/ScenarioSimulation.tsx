"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";
import {
  RenewalSimulation,
  TerminationSimulation,
  RenewalResults,
  TerminationResults,
  ContractData,
} from "./contract-simulation";

interface ScenarioSimulationProps {
  contractId: string;
  contractName?: string;
}

/**
 * ScenarioSimulation component allows users to simulate different scenarios
 * for contract renewal and termination.
 */
export default function ScenarioSimulation({
  contractId,
  contractName = "Contrato",
}: ScenarioSimulationProps) {
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewalResults, setRenewalResults] = useState<any>(null);
  const [terminationResults, setTerminationResults] = useState<any>(null);

  useEffect(() => {
    if (contractId) {
      fetchContractData();
    }
  }, [contractId]);

  /**
   * Fetches contract data from the API or creates mock data if needed
   */
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

      // Create contract data object with fallbacks to mock data if needed
      const contractData: ContractData = {
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

      setContract(contractData);
    } catch (err: any) {
      console.error("Error fetching contract data:", err);
      setError(err.message || "Erro ao carregar dados do contrato");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the simulation results for contract renewal
   */
  const handleRenewalSimulation = (results: any) => {
    setRenewalResults(results);
  };

  /**
   * Handles the simulation results for contract termination
   */
  const handleTerminationSimulation = (results: any) => {
    setTerminationResults(results);
  };

  return (
    <Card className="h-full" data-testid="scenario-simulation-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          <span>Simulação de Cenários</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div
            className="flex justify-center items-center py-12"
            data-testid="loading-spinner"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div
            className="bg-red-50 text-red-700 p-4 rounded-lg mb-4"
            data-testid="error-message"
          >
            {error}
          </div>
        ) : contract ? (
          <Tabs defaultValue="renewal" data-testid="simulation-tabs">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="renewal" data-testid="renewal-tab">
                Renovação
              </TabsTrigger>
              <TabsTrigger value="termination" data-testid="termination-tab">
                Rescisão
              </TabsTrigger>
            </TabsList>

            {/* Renewal Simulation Tab */}
            <TabsContent value="renewal" className="space-y-4 mt-4">
              <RenewalSimulation
                contract={contract}
                onSimulate={handleRenewalSimulation}
              />
              <RenewalResults results={renewalResults} />
            </TabsContent>

            {/* Termination Simulation Tab */}
            <TabsContent value="termination" className="space-y-4 mt-4">
              <TerminationSimulation
                contract={contract}
                onSimulate={handleTerminationSimulation}
              />
              <TerminationResults results={terminationResults} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8" data-testid="no-data-message">
            <p>Não foi possível carregar os dados do contrato.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
