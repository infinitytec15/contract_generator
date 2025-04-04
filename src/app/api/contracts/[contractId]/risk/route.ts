import { createClient } from "../../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { analyzeContractRisk } from "@/utils/riskAnalysis";

// GET: Retrieve risk analysis for a contract
export async function GET(
  request: NextRequest,
  { params }: { params: { contractId: string } },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get contract with risk analysis
    const { data: contract, error } = await supabase
      .from("contracts")
      .select("risk_score, risk_analysis")
      .eq("id", params.contractId)
      .single();

    if (error) {
      console.error("Error fetching contract risk data:", error);
      return NextResponse.json(
        { error: "Failed to fetch risk analysis" },
        { status: 500 },
      );
    }

    if (!contract.risk_analysis) {
      // If no risk analysis exists, perform analysis
      const riskAnalysis = await analyzeContractRisk(params.contractId);
      return NextResponse.json(riskAnalysis);
    }

    return NextResponse.json(contract.risk_analysis);
  } catch (err: any) {
    console.error("Unexpected error in risk analysis API:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// POST: Trigger a new risk analysis for a contract
export async function POST(
  request: NextRequest,
  { params }: { params: { contractId: string } },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Perform risk analysis
    const riskAnalysis = await analyzeContractRisk(params.contractId);

    // Record in history
    await supabase.from("contract_history").insert({
      contract_id: params.contractId,
      user_id: user.id,
      action: "risk_analysis_performed",
      details: {
        risk_score: riskAnalysis.score,
        risk_level: riskAnalysis.riskLevel,
      },
      ip_address: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json(riskAnalysis);
  } catch (err: any) {
    console.error("Unexpected error in risk analysis API:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
