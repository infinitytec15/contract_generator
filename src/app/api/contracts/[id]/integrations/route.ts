import { createClient } from "../../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Retrieve all integrations for a contract
export async function GET(
  request: NextRequest,
  { params }: { params: { contractId: string } }
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
        { status: 401 }
      );
    }

    // Get contract integrations with integration details
    const { data: contractIntegrations, error } = await supabase
      .from("contract_integrations")
      .select(
        "id, external_id, sync_status, last_synced_at, created_at, updated_at, integration:integration_id(id, name, type, base_url, status)"
      )
      .eq("contract_id", params.contractId);

    if (error) {
      console.error("Error fetching contract integrations:", error);
      return NextResponse.json(
        { error: "Failed to fetch integrations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ integrations: contractIntegrations });
  } catch (err) {
    console.error("Unexpected error in contract integrations API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST: Add an integration to a contract
export async function POST(
  request: NextRequest,
  { params }: { params: { contractId: string } }
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
        { status: 401 }
      );
    }

    // Get request body
    const { integration_id, external_id } = await request.json();

    if (!integration_id) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    // Check if integration exists
    const { data: integration, error: integrationError } = await supabase
      .from("external_integrations")
      .select("id")
      .eq("id", integration_id)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    // Check if contract exists
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("id")
      .eq("id", params.contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Check if this integration is already linked to this contract
    const { data: existingLink, error: linkError } = await supabase
      .from("contract_integrations")
      .select("id")
      .eq("contract_id", params.contractId)
      .eq("integration_id", integration_id);

    if (!linkError && existingLink && existingLink.length > 0) {
      return NextResponse.json(
        { error: "This integration is already linked to this contract" },
        { status: 400 }
      );
    }

    // Add integration to contract
    const { data: contractIntegration, error } = await supabase
      .from("contract_integrations")
      .insert({
        contract_id: params.contractId,
        integration_id,
        external_id: external_id || null,
        sync_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        "id, external_id, sync_status, last_synced_at, created_at, updated_at, integration:integration_id(id, name, type, base_url, status)"
      )
      .single();

    if (error) {
      console.error("Error adding integration to contract:", error);
      return NextResponse.json(
        { error: "Failed to add integration to contract" },
        { status: 500 }
      );
    }

    // Record in history
    await supabase.from("contract_history").insert({
      contract_id: params.contractId,
      user_id: user.id,
      action: "integration_added",
      details: {
        integration_id,
        integration_name: contractIntegration.integration.name,
        integration_type: contractIntegration.integration.type,
      },
      ip_address: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json({ integration: contractIntegration });
  } catch (err) {
    console.error(
      "Unexpected error in contract integration add API:",
      err
    );
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an integration from a contract
export async function DELETE(
  request: NextRequest,
  { params }: { params: { contractId: string } }
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
        { status: 401 }
      );
    }

    // Get integration link ID from URL
    const url = new URL(request.url);
    const linkId = url.searchParams.get("linkId");

    if (!linkId) {
      return NextResponse.json(
        { error: "Integration link ID is required" },
        { status: 400 }
      );
    }

    // Get integration details first for history
    const { data: linkDetails, error: fetchError } = await supabase
      .from("contract_integrations")
      .select("integration:integration_id(name, type)")
      .eq("id", linkId)
      .eq("contract_id", params.contractId)
      .single();

    if (fetchError || !linkDetails) {
      console.error("Error fetching integration link:", fetchError);
      return NextResponse.json(
        { error: "Integration link not found" },
        { status: 404 }
      );
    }

    // Delete the integration link
    const { error: deleteError } = await supabase
      .from("contract_integrations")
      .delete()
      .eq("id", linkId)
      .eq("contract_id", params.contractId);

    if (deleteError) {
      console.error("Error deleting integration link:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove integration from contract" },
        { status: 500 }
      );
