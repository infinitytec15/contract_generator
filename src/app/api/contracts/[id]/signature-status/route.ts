import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../../supabase/server";
import { createZapSignClient } from "@/utils/zapSign";
import { createNotification } from "@/utils/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: { contractId: string } },
) {
  try {
    const supabase = await createClient();
    const contractId = params.contractId;

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obter dados do contrato
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*, clients(*)")
      .eq("id", contractId)
      .single();

    if (contractError || !contract) {
      console.error("Error fetching contract:", contractError);
      return NextResponse.json(
        { error: contractError?.message || "Contract not found" },
        { status: 404 },
      );
    }

    // Verificar se o usuário tem permissão para acessar este contrato
    if (contract.user_id !== user.id) {
      // Verificar se o usuário é admin
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select(
          `
          role_id,
          roles(name)
        `,
        )
        .eq("user_id", user.id);

      const isAdmin = userRoles?.some(
        (ur) => ur.roles?.name === "admin" || ur.roles?.name === "super_admin",
      );

      if (!isAdmin) {
        return NextResponse.json(
          { error: "You don't have permission to access this contract" },
          { status: 403 },
        );
      }
    }

    // Se não houver token de assinatura, retornar status como não enviado
    if (!contract.signature_token) {
      return NextResponse.json({
        status: "not_sent",
        message: "Contract has not been sent for signature",
      });
    }

    // Obter status da assinatura do ZapSign
    const zapSignClient = createZapSignClient();
    const signatureStatus = await zapSignClient.getDocumentStatus(
      contract.signature_token,
    );

    // Verificar se o status mudou e atualizar no banco de dados
    if (signatureStatus.status !== contract.signature_status) {
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          signature_status: signatureStatus.status,
          signature_data: {
            ...contract.signature_data,
            status: signatureStatus,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        console.error("Error updating contract signature status:", updateError);
      }

      // Se o contrato foi totalmente assinado, criar notificação
      if (signatureStatus.status === "signed") {
        // Baixar o PDF assinado
        const signedPdf = await zapSignClient.getSignedPdf(
          contract.signature_token,
        );

        // Fazer upload do PDF assinado para o storage
        const signedFileName = `signed/${contractId}-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("contracts")
          .upload(signedFileName, signedPdf, {
            contentType: "application/pdf",
          });

        if (uploadError) {
          console.error("Error uploading signed PDF:", uploadError);
        } else {
          // Obter URL pública do PDF assinado
          const {
            data: { publicUrl },
          } = supabase.storage.from("contracts").getPublicUrl(signedFileName);

          // Atualizar contrato com URL do PDF assinado
          await supabase
            .from("contracts")
            .update({
              signed_file_path: signedFileName,
              signed_file_url: publicUrl,
            })
            .eq("id", contractId);

          // Criar notificação
          await createNotification({
            user_id: contract.user_id,
            title: "Contrato Assinado",
            message: `O contrato ${contract.name} foi assinado por todos os participantes`,
            link: `/contracts/${contractId}/details`,
          });
        }
      }
    }

    return NextResponse.json({
      status: signatureStatus.status,
      details: signatureStatus,
    });
  } catch (error: any) {
    console.error("Error checking signature status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check signature status" },
      { status: 500 },
    );
  }
}
