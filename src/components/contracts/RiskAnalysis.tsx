"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Shield,
  RefreshCw,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  RiskAnalysisResult,
  getRiskLevelColor,
  getRiskLevelLabel,
} from "@/utils/riskAnalysis";

interface RiskAnalysisProps {
  contractId: string;
}

export default function RiskAnalysis({ contractId }: RiskAnalysisProps) {
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRiskAnalysis();
  }, [contractId]);

  const fetchRiskAnalysis = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get contract with risk analysis
      const { data: contract, error } = await supabase
        .from("contracts")
        .select("risk_score, risk_analysis")
        .eq("id", contractId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (contract && contract.risk_analysis) {
        setRiskAnalysis(contract.risk_analysis as RiskAnalysisResult);
      } else {
        // If no risk analysis exists, trigger analysis
        await refreshRiskAnalysis();
      }
    } catch (err: any) {
      console.error("Error fetching risk analysis:", err);
      setError(err.message || "Erro ao carregar análise de risco");
    } finally {
      setLoading(false);
    }
  };

  const refreshRiskAnalysis = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Call API to refresh risk analysis
      const response = await fetch(`/api/contracts/${contractId}/risk`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar análise de risco");
      }

      const data = await response.json();
      setRiskAnalysis(data);
    } catch (err: any) {
      console.error("Error refreshing risk analysis:", err);
      setError(err.message || "Erro ao atualizar análise de risco");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Análise de Risco</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Análise de Risco</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
          <Button
            onClick={refreshRiskAnalysis}
            className="flex items-center gap-2"
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Atualizando..." : "Tentar Novamente"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!riskAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Análise de Risco</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="mb-4">
              Nenhuma análise de risco disponível para este contrato.
            </p>
            <Button
              onClick={refreshRiskAnalysis}
              className="flex items-center gap-2"
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Analisando..." : "Analisar Risco"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span>Análise de Risco</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshRiskAnalysis}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw
            className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Risk Score */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium">Score de Risco</h3>
              <div className="flex items-center justify-center mt-1">
                <Badge
                  className={`text-sm px-3 py-1 ${getRiskLevelColor(riskAnalysis.riskLevel)}`}
                >
                  {getRiskLevelLabel(riskAnalysis.riskLevel)}
                </Badge>
              </div>
            </div>
            <div className="w-full max-w-md">
              <Progress
                value={riskAnalysis.score}
                max={100}
                className="h-3"
                indicatorClassName={
                  riskAnalysis.riskLevel === "low"
                    ? "bg-green-500"
                    : riskAnalysis.riskLevel === "medium"
                      ? "bg-yellow-500"
                      : riskAnalysis.riskLevel === "high"
                        ? "bg-orange-500"
                        : "bg-red-500"
                }
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{riskAnalysis.score}</p>
          </div>

          <Tabs defaultValue="factors">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="factors">Fatores de Risco</TabsTrigger>
              <TabsTrigger value="clauses">Cláusulas Sensíveis</TabsTrigger>
              <TabsTrigger value="external">Dados Externos</TabsTrigger>
            </TabsList>

            {/* Risk Factors Tab */}
            <TabsContent value="factors" className="space-y-4 mt-4">
              {riskAnalysis.factors.map((factor, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-md p-3 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">
                      {factor.type.replace("_", " ").toUpperCase()}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`${factor.impact > 7 ? "bg-red-100 text-red-800" : factor.impact > 4 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                    >
                      Impacto: {factor.impact}/10
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {factor.description}
                  </p>
                  {factor.recommendation && (
                    <p className="text-sm text-blue-600 mt-2">
                      <span className="font-medium">Recomendação:</span>{" "}
                      {factor.recommendation}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex gap-4 mt-4">
                <div className="flex-1 bg-white border rounded-md p-3 shadow-sm">
                  <h4 className="font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" /> Risco Financeiro
                  </h4>
                  <div className="mt-2">
                    <Badge
                      className={`${getRiskLevelColor(riskAnalysis.financialRisk.riskLevel)}`}
                    >
                      {getRiskLevelLabel(riskAnalysis.financialRisk.riskLevel)}
                    </Badge>
                    <p className="text-sm mt-1">
                      Valor:{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: riskAnalysis.financialRisk.currency,
                      }).format(riskAnalysis.financialRisk.value)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 bg-white border rounded-md p-3 shadow-sm">
                  <h4 className="font-medium flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Risco de Duração
                  </h4>
                  <div className="mt-2">
                    <Badge
                      className={`${getRiskLevelColor(riskAnalysis.durationRisk.riskLevel)}`}
                    >
                      {getRiskLevelLabel(riskAnalysis.durationRisk.riskLevel)}
                    </Badge>
                    <p className="text-sm mt-1">
                      Duração: {riskAnalysis.durationRisk.months} meses
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sensitive Clauses Tab */}
            <TabsContent value="clauses" className="space-y-4 mt-4">
              {riskAnalysis.sensitiveClausesFound.length === 0 ? (
                <p className="text-center py-4">
                  Nenhuma cláusula sensível identificada.
                </p>
              ) : (
                riskAnalysis.sensitiveClausesFound.map((clause, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-md p-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium flex items-center gap-1">
                        <AlertTriangle
                          className={`h-4 w-4 ${clause.riskLevel === "high" || clause.riskLevel === "critical" ? "text-red-500" : "text-yellow-500"}`}
                        />
                        {clause.type.charAt(0).toUpperCase() +
                          clause.type.slice(1)}
                      </h4>
                      <Badge
                        className={`${getRiskLevelColor(clause.riskLevel)}`}
                      >
                        {getRiskLevelLabel(clause.riskLevel)}
                      </Badge>
                    </div>
                    <p className="text-sm mt-2 p-2 bg-gray-50 rounded border border-gray-200 italic">
                      "{clause.text}"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Localização: Página {clause.location.page}, Parágrafo{" "}
                      {clause.location.paragraph}
                    </p>
                    {clause.recommendation && (
                      <p className="text-sm text-blue-600 mt-2">
                        <span className="font-medium">Recomendação:</span>{" "}
                        {clause.recommendation}
                      </p>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* External Data Tab */}
            <TabsContent value="external" className="space-y-4 mt-4">
              {!riskAnalysis.externalData ||
              riskAnalysis.externalData.length === 0 ? (
                <p className="text-center py-4">
                  Nenhum dado externo disponível.
                </p>
              ) : (
                riskAnalysis.externalData.map((data, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-md p-3 shadow-sm"
                  >
                    <h4 className="font-medium">{data.source}</h4>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {data.score !== undefined && (
                        <div>
                          <p className="text-sm text-gray-500">Score</p>
                          <p className="font-medium">{data.score}</p>
                        </div>
                      )}
                      {data.status !== undefined && (
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium">{data.status}</p>
                        </div>
                      )}
                    </div>
                    {data.details && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Detalhes</p>
                        <div className="text-sm">
                          {Object.entries(data.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </span>
                              <span className="font-medium">
                                {value as string}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
