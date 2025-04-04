import { createClient } from "../../supabase/server";

// Types for risk analysis
export interface RiskAnalysisResult {
  score: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  factors: RiskFactor[];
  sensitiveClausesFound: SensitiveClause[];
  financialRisk: {
    value: number;
    currency: string;
    riskLevel: "low" | "medium" | "high" | "critical";
  };
  durationRisk: {
    months: number;
    riskLevel: "low" | "medium" | "high" | "critical";
  };
  externalData?: {
    source: string;
    score?: number;
    status?: string;
    details?: any;
  }[];
}

export interface RiskFactor {
  type: string;
  description: string;
  impact: number; // 1-10
  recommendation?: string;
}

export interface SensitiveClause {
  type: string;
  text: string;
  location: {
    page: number;
    paragraph: number;
  };
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendation?: string;
}

// Sensitive clause types to look for
export const SENSITIVE_CLAUSE_TYPES = [
  "multa",
  "rescisão",
  "distrato",
  "confidencialidade",
  "exclusividade",
  "não-concorrência",
  "indenização",
  "arbitragem",
  "foro",
  "reajuste",
];

/**
 * Calculate risk score based on contract data
 * @param contractId The ID of the contract to analyze
 * @returns Risk analysis result
 */
export async function analyzeContractRisk(
  contractId: string,
): Promise<RiskAnalysisResult> {
  const supabase = await createClient();

  // Get contract data
  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*, clients(*)")
    .eq("id", contractId)
    .single();

  if (error || !contract) {
    throw new Error(
      `Failed to get contract data: ${error?.message || "Contract not found"}`,
    );
  }

  // Mock implementation - in a real scenario, this would use NLP and external APIs
  const mockRiskAnalysis: RiskAnalysisResult = {
    score: Math.floor(Math.random() * 100), // 0-100
    riskLevel: "medium",
    factors: [
      {
        type: "contract_duration",
        description: "Contrato com duração superior a 24 meses",
        impact: 6,
        recommendation: "Considere incluir cláusulas de revisão periódica",
      },
      {
        type: "financial_exposure",
        description:
          "Valor do contrato representa exposição financeira significativa",
        impact: 7,
        recommendation: "Avalie a possibilidade de garantias adicionais",
      },
    ],
    sensitiveClausesFound: [
      {
        type: "multa",
        text: "Multa de 50% do valor total do contrato em caso de rescisão antecipada",
        location: { page: 2, paragraph: 4 },
        riskLevel: "high",
        recommendation:
          "Negocie um percentual menor ou escalonado conforme o tempo de contrato",
      },
      {
        type: "confidencialidade",
        text: "Obrigação de confidencialidade por período indeterminado após o término do contrato",
        location: { page: 3, paragraph: 2 },
        riskLevel: "medium",
        recommendation:
          "Defina um prazo específico para a obrigação de confidencialidade",
      },
    ],
    financialRisk: {
      value: 50000,
      currency: "BRL",
      riskLevel: "medium",
    },
    durationRisk: {
      months: 36,
      riskLevel: "medium",
    },
    externalData: [
      {
        source: "Serasa",
        score: 750,
        status: "Regular",
        details: {
          pendingIssues: 0,
          creditScore: "A",
        },
      },
    ],
  };

  // Determine overall risk level based on score
  if (mockRiskAnalysis.score < 30) {
    mockRiskAnalysis.riskLevel = "low";
  } else if (mockRiskAnalysis.score < 60) {
    mockRiskAnalysis.riskLevel = "medium";
  } else if (mockRiskAnalysis.score < 85) {
    mockRiskAnalysis.riskLevel = "high";
  } else {
    mockRiskAnalysis.riskLevel = "critical";
  }

  // Update contract with risk analysis
  await supabase
    .from("contracts")
    .update({
      risk_score: mockRiskAnalysis.score,
      risk_analysis: mockRiskAnalysis,
    })
    .eq("id", contractId);

  return mockRiskAnalysis;
}

/**
 * Get risk level color
 * @param riskLevel Risk level
 * @returns CSS color class
 */
export function getRiskLevelColor(
  riskLevel: "low" | "medium" | "high" | "critical",
): string {
  switch (riskLevel) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Get risk level label in Portuguese
 * @param riskLevel Risk level
 * @returns Portuguese label
 */
export function getRiskLevelLabel(
  riskLevel: "low" | "medium" | "high" | "critical",
): string {
  switch (riskLevel) {
    case "low":
      return "Baixo";
    case "medium":
      return "Médio";
    case "high":
      return "Alto";
    case "critical":
      return "Crítico";
    default:
      return "Desconhecido";
  }
}
