import { createClient } from "../../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST: Process a chat message and return a response
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

    // Get request body
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Get contract data
    const { data: contract, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", params.contractId)
      .single();

    if (error) {
      console.error("Error fetching contract:", error);
      return NextResponse.json(
        { error: "Failed to fetch contract data" },
        { status: 500 },
      );
    }

    // In a real implementation, this would call an LLM API like OpenAI
    // For now, we'll use a simple rule-based approach
    let response = "";
    const lowercaseMessage = message.toLowerCase();

    // Mock responses based on common questions
    if (
      lowercaseMessage.includes("expira") ||
      lowercaseMessage.includes("vencimento") ||
      lowercaseMessage.includes("término")
    ) {
      response = `Este contrato expira em ${contract.end_date ? new Date(contract.end_date).toLocaleDateString() : "data não especificada"}.`;
    } else if (
      lowercaseMessage.includes("responsável") ||
      lowercaseMessage.includes("gestor")
    ) {
      response = `O responsável por este contrato é ${contract.responsible_name || "não especificado"} (${contract.responsible_email || "email não especificado"}).`;
    } else if (
      lowercaseMessage.includes("rescisão") ||
      lowercaseMessage.includes("cancelamento")
    ) {
      response =
        "A cláusula 8.3 trata da rescisão contratual. Ela estabelece que qualquer parte pode rescindir o contrato com aviso prévio de 30 dias, sujeito a multa de 20% do valor remanescente.";
    } else if (
      lowercaseMessage.includes("renovação") ||
      lowercaseMessage.includes("renovar")
    ) {
      response =
        "Sim, este contrato possui renovação automática por períodos iguais de 12 meses, conforme cláusula 10.1, a menos que uma das partes notifique a outra com 60 dias de antecedência.";
    } else if (
      lowercaseMessage.includes("multa") ||
      lowercaseMessage.includes("penalidade")
    ) {
      response =
        "A cláusula 9.2 estabelece multa de 2% mais juros de 1% ao mês para pagamentos em atraso. Para rescisão antecipada, a multa é de 20% do valor remanescente do contrato.";
    } else if (
      lowercaseMessage.includes("pagamento") ||
      lowercaseMessage.includes("valor")
    ) {
      response = `O valor deste contrato é de ${contract.value ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(contract.value) : "valor não especificado"}, com pagamento conforme cláusula 5.1.`;
    } else if (lowercaseMessage.includes("reajuste")) {
      response =
        "O contrato prevê reajuste anual pelo IPCA, conforme cláusula 5.3.";
    } else if (
      lowercaseMessage.includes("confidencialidade") ||
      lowercaseMessage.includes("sigilo")
    ) {
      response =
        "A cláusula 12 trata da confidencialidade, que se estende por 5 anos após o término do contrato.";
    } else {
      response =
        "Não tenho informações específicas sobre isso. Poderia reformular sua pergunta ou perguntar sobre datas de vencimento, responsáveis, cláusulas de rescisão ou renovação?";
    }

    // Record chat interaction in history
    await supabase.from("contract_history").insert({
      contract_id: params.contractId,
      user_id: user.id,
      action: "chatbot_interaction",
      details: { user_message: message, bot_response: response },
      ip_address: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json({ response });
  } catch (err: any) {
    console.error("Unexpected error in contract chat API:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
