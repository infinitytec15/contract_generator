import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { createNotification } from "@/utils/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Verificar se o webhook é válido
    const webhookSecret = process.env.ZAPSIGN_WEBHOOK_SECRET;
    const signature = request.headers.get("X-ZapSign-Signature");

    if (webhookSecret && signature !== webhookSecret) {
      console.error("Invalid ZapSign webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Processar o evento
    const { event, doc } = body;

    if (!doc || !doc.external_id) {
      console.error("Missing document or external_id in webhook payload");
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 },
      );
    }

    const contractId = doc.external_id;

    // Obter dados do contrato
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*, clients(*)")
      .eq("id", contractId)
      .single();

    if (contractError || !contract) {
      console.error("Error fetching contract:", contractError);
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    // Atualizar status do contrato com base no evento
    let newStatus = contract.signature_status;
    let notificationTitle = "";
    let notificationMessage = "";

    switch (event) {
      case "doc.signed":
        newStatus = "signed";
        notificationTitle = "Contrato Assinado";
        notificationMessage = `O contrato ${contract.name} foi assinado por todos os participantes`;
        break;

      case "doc.signed_by_signer":
        newStatus = "partially_signed";
        const signerName = body.signer?.name || "Um signatário";
        notificationTitle = "Assinatura Parcial";
        notificationMessage = `${signerName} assinou o contrato ${contract.name}`;
        break;

      case "doc.viewed_by_signer":
        const viewerName = body.signer?.name || "Um signatário";
        notificationTitle = "Contrato Visualizado";
        notificationMessage = `${viewerName} visualizou o contrato ${contract.name}`;
        break;

      case "doc.refused_by_signer":
        newStatus = "refused";
        const refuserName = body.signer?.name || "Um signatário";
        notificationTitle = "Contrato Recusado";
        notificationMessage = `${refuserName} recusou o contrato ${contract.name}`;
        break;

      default:
        console.log(`Unhandled ZapSign event: ${event}`);
        return NextResponse.json({ success: true });
    }

    // Atualizar o contrato
    if (newStatus !== contract.signature_status) {
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          signature_status: newStatus,
          signature_data: { ...contract.signature_data, latest_event: body },
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        console.error("Error updating contract status:", updateError);
      }
    }

    // Criar notificação se houver mensagem
    if (notificationTitle && notificationMessage) {
      await createNotification({
        user_id: contract.user_id,
        title: notificationTitle,
        message: notificationMessage,
        link: `/contracts/${contractId}/details`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing ZapSign webhook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 500 },
    );
  }
}
