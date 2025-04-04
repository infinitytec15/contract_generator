/**
 * @jest-environment node
 */

import {
  analyzeContractRisk,
  getRiskLevelColor,
  getRiskLevelLabel,
} from "../riskAnalysis";

// Mock the createClient function
jest.mock("../../../supabase/server", () => ({
  createClient: jest.fn().mockImplementation(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        id: "test-contract-id",
        name: "Test Contract",
        value: 100000,
        currency: "BRL",
        contract_type: "service",
        effective_date: "2023-01-01",
        termination_date: "2025-01-01",
        clients: {
          id: "test-client-id",
          name: "Test Client",
        },
      },
      error: null,
    }),
    update: jest.fn().mockReturnThis(),
  })),
}));

describe("Risk Analysis Utility", () => {
  describe("analyzeContractRisk", () => {
    it("should analyze contract risk and return a valid result", async () => {
      const result = await analyzeContractRisk("test-contract-id");

      // Check that the result has the expected structure
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("riskLevel");
      expect(result).toHaveProperty("factors");
      expect(result).toHaveProperty("sensitiveClausesFound");
      expect(result).toHaveProperty("financialRisk");
      expect(result).toHaveProperty("durationRisk");
      expect(result).toHaveProperty("externalData");

      // Check that the score is within the expected range
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);

      // Check that the risk level is one of the expected values
      expect(["low", "medium", "high", "critical"]).toContain(result.riskLevel);
    });
  });

  describe("getRiskLevelColor", () => {
    it("should return the correct color class for each risk level", () => {
      expect(getRiskLevelColor("low")).toBe("bg-green-100 text-green-800");
      expect(getRiskLevelColor("medium")).toBe("bg-yellow-100 text-yellow-800");
      expect(getRiskLevelColor("high")).toBe("bg-orange-100 text-orange-800");
      expect(getRiskLevelColor("critical")).toBe("bg-red-100 text-red-800");
      expect(getRiskLevelColor("unknown" as any)).toBe(
        "bg-gray-100 text-gray-800",
      );
    });
  });

  describe("getRiskLevelLabel", () => {
    it("should return the correct Portuguese label for each risk level", () => {
      expect(getRiskLevelLabel("low")).toBe("Baixo");
      expect(getRiskLevelLabel("medium")).toBe("Médio");
      expect(getRiskLevelLabel("high")).toBe("Alto");
      expect(getRiskLevelLabel("critical")).toBe("Crítico");
      expect(getRiskLevelLabel("unknown" as any)).toBe("Desconhecido");
    });
  });
});
