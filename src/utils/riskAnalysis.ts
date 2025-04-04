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

  // Initialize risk analysis result
  const riskAnalysis: RiskAnalysisResult = {
    score: 0,
    riskLevel: "low",
    factors: [],
    sensitiveClausesFound: [],
    financialRisk: {
      value: contract.value || 0,
      currency: contract.currency || "BRL",
      riskLevel: "low",
    },
    durationRisk: {
      months: 0,
      riskLevel: "low",
    },
    externalData: [],
  };

  // Calculate duration risk
  if (contract.effective_date && contract.termination_date) {
    const startDate = new Date(contract.effective_date);
    const endDate = new Date(contract.termination_date);
    const durationMonths = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );

    riskAnalysis.durationRisk.months = durationMonths;

    // Assign risk level based on duration
    if (durationMonths <= 12) {
      riskAnalysis.durationRisk.riskLevel = "low";
    } else if (durationMonths <= 36) {
      riskAnalysis.durationRisk.riskLevel = "medium";
      riskAnalysis.factors.push({
        type: "contract_duration",
        description: "Contrato com duração superior a 12 meses",
        impact: 4,
        recommendation: "Considere incluir cláusulas de revisão anual",
      });
    } else if (durationMonths <= 60) {
      riskAnalysis.durationRisk.riskLevel = "high";
      riskAnalysis.factors.push({
        type: "contract_duration",
        description: "Contrato com duração superior a 36 meses",
        impact: 7,
        recommendation:
          "Considere incluir cláusulas de revisão periódica e opções de saída",
      });
    } else {
      riskAnalysis.durationRisk.riskLevel = "critical";
      riskAnalysis.factors.push({
        type: "contract_duration",
        description: "Contrato com duração superior a 60 meses",
        impact: 9,
        recommendation:
          "Reavalie a necessidade de um contrato tão longo ou inclua cláusulas de proteção",
      });
    }
  }

  // Calculate financial risk
  if (contract.value) {
    const value = parseFloat(contract.value.toString());
    riskAnalysis.financialRisk.value = value;

    // Assign risk level based on value
    // These thresholds should be adjusted based on business requirements
    if (value <= 10000) {
      riskAnalysis.financialRisk.riskLevel = "low";
    } else if (value <= 50000) {
      riskAnalysis.financialRisk.riskLevel = "medium";
      riskAnalysis.factors.push({
        type: "financial_exposure",
        description:
          "Valor do contrato representa exposição financeira moderada",
        impact: 5,
        recommendation: "Considere solicitar garantias básicas",
      });
    } else if (value <= 200000) {
      riskAnalysis.financialRisk.riskLevel = "high";
      riskAnalysis.factors.push({
        type: "financial_exposure",
        description:
          "Valor do contrato representa exposição financeira significativa",
        impact: 7,
        recommendation:
          "Avalie a possibilidade de garantias adicionais e pagamentos escalonados",
      });
    } else {
      riskAnalysis.financialRisk.riskLevel = "critical";
      riskAnalysis.factors.push({
        type: "financial_exposure",
        description:
          "Valor do contrato representa exposição financeira crítica",
        impact: 9,
        recommendation:
          "Exija garantias robustas, pagamentos escalonados e aprovação de nível superior",
      });
    }
  }

  // Analyze sensitive clauses (simplified version - in production would use NLP)
  // For now, we'll add some mock sensitive clauses based on contract type
  if (contract.contract_type === "service") {
    riskAnalysis.sensitiveClausesFound.push({
      type: "multa",
      text: "Multa de 50% do valor total do contrato em caso de rescisão antecipada",
      location: { page: 2, paragraph: 4 },
      riskLevel: "high",
      recommendation:
        "Negocie um percentual menor ou escalonado conforme o tempo de contrato",
    });
  } else if (contract.contract_type === "confidentiality") {
    riskAnalysis.sensitiveClausesFound.push({
      type: "confidencialidade",
      text: "Obrigação de confidencialidade por período indeterminado após o término do contrato",
      location: { page: 1, paragraph: 3 },
      riskLevel: "medium",
      recommendation:
        "Defina um prazo específico para a obrigação de confidencialidade",
    });
  }

  // Add mock external data (in production would call actual APIs)
  riskAnalysis.externalData = [
    {
      source: "Serasa",
      score: 750,
      status: "Regular",
      details: {
        pendingIssues: 0,
        creditScore: "A",
      },
    },
  ];

  // Calculate overall risk score based on all factors
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Add duration risk to score
  switch (riskAnalysis.durationRisk.riskLevel) {
    case "low":
      totalScore += 0;
      maxPossibleScore += 25;
      break;
    case "medium":
      totalScore += 15;
      maxPossibleScore += 25;
      break;
    case "high":
      totalScore += 20;
      maxPossibleScore += 25;
      break;
    case "critical":
      totalScore += 25;
      maxPossibleScore += 25;
      break;
  }

  // Add financial risk to score
  switch (riskAnalysis.financialRisk.riskLevel) {
    case "low":
      totalScore += 0;
      maxPossibleScore += 25;
      break;
    case "medium":
      totalScore += 15;
      maxPossibleScore += 25;
      break;
    case "high":
      totalScore += 20;
      maxPossibleScore += 25;
      break;
    case "critical":
      totalScore += 25;
      maxPossibleScore += 25;
      break;
  }

  // Add sensitive clauses to score
  riskAnalysis.sensitiveClausesFound.forEach((clause) => {
    switch (clause.riskLevel) {
      case "low":
        totalScore += 5;
        break;
      case "medium":
        totalScore += 10;
        break;
      case "high":
        totalScore += 15;
        break;
      case "critical":
        totalScore += 25;
        break;
    }
    maxPossibleScore += 25;
  });

  // Add risk factors to score
  riskAnalysis.factors.forEach((factor) => {
    totalScore += factor.impact * 2.5; // Scale impact (1-10) to a 25-point scale
    maxPossibleScore += 25;
  });

  // Ensure we have at least some factors to calculate score
  if (maxPossibleScore === 0) {
    maxPossibleScore = 50;
    totalScore = 0;
  }

  // Calculate final score as percentage of maximum possible score
  riskAnalysis.score = Math.round((totalScore / maxPossibleScore) * 100);

  // Determine overall risk level based on score
  if (riskAnalysis.score < 30) {
    riskAnalysis.riskLevel = "low";
  } else if (riskAnalysis.score < 60) {
    riskAnalysis.riskLevel = "medium";
  } else if (riskAnalysis.score < 85) {
    riskAnalysis.riskLevel = "high";
  } else {
    riskAnalysis.riskLevel = "critical";
  }

  // Update contract with risk analysis
  await supabase
    .from("contracts")
    .update({
      risk_score: riskAnalysis.score,
      risk_analysis: riskAnalysis,
    })
    .eq("id", contractId);

  return riskAnalysis;
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
