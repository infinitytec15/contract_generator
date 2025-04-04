/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScenarioSimulation from "../ScenarioSimulation";
import { createClient } from "../../../../supabase/client";

// Mock the Supabase client
jest.mock("../../../../supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock the contract-simulation components
jest.mock("../contract-simulation", () => ({
  RenewalSimulation: ({ contract, onSimulate }: any) => (
    <div data-testid="renewal-simulation">
      <button onClick={() => onSimulate({ newValue: 6000 })}>
        Simulate Renewal
      </button>
    </div>
  ),
  TerminationSimulation: ({ contract, onSimulate }: any) => (
    <div data-testid="termination-simulation">
      <button onClick={() => onSimulate({ penaltyValue: 1000 })}>
        Simulate Termination
      </button>
    </div>
  ),
  RenewalResults: ({ results }: any) => (
    <div data-testid="renewal-results">
      {results ? `New Value: ${results.newValue}` : "No results"}
    </div>
  ),
  TerminationResults: ({ results }: any) => (
    <div data-testid="termination-results">
      {results ? `Penalty: ${results.penaltyValue}` : "No results"}
    </div>
  ),
}));

describe("ScenarioSimulation Component", () => {
  const mockContract = {
    id: "contract-123",
    name: "Test Contract",
    start_date: "2023-01-01T00:00:00.000Z",
    end_date: "2024-01-01T00:00:00.000Z",
    value: 5000,
    currency: "BRL",
    payment_frequency: "monthly",
    adjustment_index: "IPCA",
    adjustment_percentage: 100,
    penalty_percentage: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially", () => {
    // Mock Supabase response with loading state
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => new Promise(() => {})), // Never resolves to keep loading
    });

    render(<ScenarioSimulation contractId="contract-123" />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("renders error state when API call fails", async () => {
    // Mock Supabase response with error
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "API Error" },
      }),
    });

    render(<ScenarioSimulation contractId="contract-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "API Error",
      );
    });
  });

  test("renders contract simulation tabs when data is loaded", async () => {
    // Mock Supabase response with success
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockContract,
        error: null,
      }),
    });

    render(<ScenarioSimulation contractId="contract-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("simulation-tabs")).toBeInTheDocument();
      expect(screen.getByTestId("renewal-tab")).toBeInTheDocument();
      expect(screen.getByTestId("termination-tab")).toBeInTheDocument();
    });
  });

  test("handles renewal simulation correctly", async () => {
    // Mock Supabase response with success
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockContract,
        error: null,
      }),
    });

    render(<ScenarioSimulation contractId="contract-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("renewal-simulation")).toBeInTheDocument();
    });

    // Simulate renewal
    fireEvent.click(screen.getByText("Simulate Renewal"));

    await waitFor(() => {
      expect(screen.getByTestId("renewal-results")).toHaveTextContent(
        "New Value: 6000",
      );
    });
  });

  test("handles termination simulation correctly", async () => {
    // Mock Supabase response with success
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockContract,
        error: null,
      }),
    });

    render(<ScenarioSimulation contractId="contract-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("simulation-tabs")).toBeInTheDocument();
    });

    // Switch to termination tab
    fireEvent.click(screen.getByTestId("termination-tab"));

    await waitFor(() => {
      expect(screen.getByTestId("termination-simulation")).toBeInTheDocument();
    });

    // Simulate termination
    fireEvent.click(screen.getByText("Simulate Termination"));

    await waitFor(() => {
      expect(screen.getByTestId("termination-results")).toHaveTextContent(
        "Penalty: 1000",
      );
    });
  });
});
