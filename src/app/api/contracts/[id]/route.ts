import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { contractId: string } },
) {
  try {
    const supabase = await createClient();

    // Get user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get contract data
    const { data: contract, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", params.contractId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(contract);
  } catch (error: any) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
