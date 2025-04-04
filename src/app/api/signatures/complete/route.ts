import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { createNotification } from "../../../../utils/notifications";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.signatureId || !body.submissionId) {
      return NextResponse.json(
        { error: "Signature ID and Submission ID are required" },
        { status: 400 },
      );
    }

    // Update signature status
    const { data: signature, error: signatureError } = await supabase
      .from("signatures")
      .update({
        status: "completed",
        signed_at: new Date().toISOString(),
        signed_document_url: body.documentUrl || null,
      })
      .eq("id", body.signatureId)
      .select(
        "*, submissions(form_link_id, submissions.*, form_links(form_id, forms(contract_id)))",
      );

    if (signatureError) {
      console.error("Error updating signature:", signatureError);
      return NextResponse.json(
        { error: signatureError.message },
        { status: 500 },
      );
    }

    if (!signature || signature.length === 0) {
      return NextResponse.json(
        { error: "Signature not found" },
        { status: 404 },
      );
    }

    // Get the contract ID from the signature data
    const contractId = signature[0].submissions?.form_links?.forms?.contract_id;

    if (!contractId) {
      console.error("Contract ID not found in signature data");
      return NextResponse.json(
        { error: "Contract ID not found" },
        { status: 500 },
      );
    }

    // Get the contract to find the owner (user_id)
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("user_id, name")
      .eq("id", contractId)
      .single();

    if (contractError) {
      console.error("Error fetching contract:", contractError);
      return NextResponse.json(
        { error: contractError.message },
        { status: 500 },
      );
    }

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    // Create notification for the contract owner
    const clientName = signature[0].submissions?.client_data?.name || "Cliente";
    await createNotification({
      user_id: contract.user_id,
      title: "Contrato Assinado",
      message: `${clientName} assinou o contrato: ${contract.name}`,
      link: `/contracts/${contractId}/details`,
    });

    return NextResponse.json({
      success: true,
      message: "Signature completed successfully",
      signature: signature[0],
    });
  } catch (error: any) {
    console.error("Error completing signature:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete signature" },
      { status: 500 },
    );
  }
}
