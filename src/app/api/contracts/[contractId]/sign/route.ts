import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../../supabase/server";
import { createZapSignClient } from "@/utils/zapSign";
import { createNotification } from "@/utils/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: { contractId: string } },
) {
  try {
    const supabase = await createClient();
    const contractId = params.contractId;
    const body = await request.json();

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
      .select("*, clients(*), contract_templates(*)")
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

    // Obter o arquivo PDF do contrato
    const { data: fileData, error: fileError } = await supabase.storage
      .from("contracts")
      .download(contract.file_path);

    if (fileError || !fileData) {
      console.error("Error downloading contract file:", fileError);
      return NextResponse.json(
        { error: "Failed to download contract file" },
        { status: 500 },
      );
    }

    // Converter o arquivo para base64
    const fileBuffer = await fileData.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString("base64");

    // Preparar os signatários
    const signers = [
      // Signatário 1: Cliente
      {
        name: contract.clients.name,
        email: contract.clients.email,
        send_automatic_email: true,
      },
      // Signatário 2: Usuário (proprietário do contrato)
      {
        name: body.userName || user.user_metadata?.full_name || user.email,
        email: user.email,
        send_automatic_email: true,
      },
    ];

    // Criar documento no ZapSign
    const zapSignClient = createZapSignClient();
    const zapSignDoc = await zapSignClient.createDocument({
      name: `${contract.name} - ${contract.clients.name}`,
      base64_pdf: base64File,
      signers,
      lang: "pt-br",
      external_id: contractId,
    });

    // Atualizar o contrato com as informações do ZapSign
    const { error: updateError } = await supabase
      .from("contracts")
      .update({
        signature_status: "pending",
        signature_provider: "zapsign",
        signature_token: zapSignDoc.token,
        signature_data: zapSignDoc,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contractId);

    if (updateError) {
      console.error(
        "Error updating contract with signature data:",
        updateError,
      );
      return NextResponse.json(
        { error: "Failed to update contract with signature data" },
        { status: 500 },
      );
    }

    // Criar notificação para o cliente
    await createNotification({
      user_id: contract.user_id,
      title: "Contrato Enviado para Assinatura",
      message: `O contrato ${contract.name} foi enviado para assinatura do cliente ${contract.clients.name}`,
      link: `/contracts/${contractId}/details`,
    });

    return NextResponse.json({
      success: true,
      message: "Contract sent for signature successfully",
      signature: {
        provider: "zapsign",
        token: zapSignDoc.token,
        signers: zapSignDoc.signers,
      },
    });
  } catch (error: any) {
    console.error("Error sending contract for signature:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send contract for signature" },
      { status: 500 },
    );
  }
}
