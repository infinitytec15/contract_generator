import { createClient } from "../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/contracts/alerts
// Retorna todas as configurações de alerta para contratos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter parâmetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const contractId = searchParams.get("contract_id");

    let query = supabase.from("contract_alerts").select("*");

    // Filtrar por ID do contrato se fornecido
    if (contractId) {
      query = query.eq("contract_id", contractId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar alertas:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("Erro na API de alertas:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/contracts/alerts
// Cria ou atualiza configurações de alerta para um contrato
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter dados do corpo da requisição
    const body = await request.json();
    const {
      contract_id,
      alert_days_before,
      alert_email,
      alert_sms,
      alert_system,
      effective_date,
      termination_date,
      renewal_date,
      adjustment_date,
    } = body;

    // Validar campos obrigatórios
    if (!contract_id) {
      return NextResponse.json(
        { error: "ID do contrato é obrigatório" },
        { status: 400 },
      );
    }

    // Verificar se já existe configuração para este contrato
    const { data: existingAlert } = await supabase
      .from("contract_alerts")
      .select("id")
      .eq("contract_id", contract_id)
      .single();

    let result;

    if (existingAlert) {
      // Atualizar configuração existente
      result = await supabase
        .from("contract_alerts")
        .update({
          alert_days_before: alert_days_before || 7,
          alert_email: alert_email !== undefined ? alert_email : true,
          alert_sms: alert_sms !== undefined ? alert_sms : false,
          alert_system: alert_system !== undefined ? alert_system : true,
          effective_date,
          termination_date,
          renewal_date,
          adjustment_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAlert.id)
        .select()
        .single();
    } else {
      // Criar nova configuração
      result = await supabase
        .from("contract_alerts")
        .insert({
          contract_id,
          alert_days_before: alert_days_before || 7,
          alert_email: alert_email !== undefined ? alert_email : true,
          alert_sms: alert_sms !== undefined ? alert_sms : false,
          alert_system: alert_system !== undefined ? alert_system : true,
          effective_date,
          termination_date,
          renewal_date,
          adjustment_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error("Erro ao salvar configuração de alerta:", result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 },
      );
    }

    // Atualizar também os campos de data no contrato
    if (effective_date || termination_date || renewal_date || adjustment_date) {
      const updateData: any = { updated_at: new Date().toISOString() };

      if (effective_date) updateData.effective_date = effective_date;
      if (termination_date) updateData.termination_date = termination_date;
      if (renewal_date) updateData.renewal_date = renewal_date;
      if (adjustment_date) updateData.adjustment_date = adjustment_date;

      const { error: contractUpdateError } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", contract_id);

      if (contractUpdateError) {
        console.error(
          "Erro ao atualizar datas do contrato:",
          contractUpdateError,
        );
      }
    }

    return NextResponse.json({ data: result.data });
  } catch (err: any) {
    console.error("Erro na API de alertas:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/contracts/alerts
// Remove configurações de alerta para um contrato
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter ID do contrato dos parâmetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const alertId = searchParams.get("id");

    if (!alertId) {
      return NextResponse.json(
        { error: "ID do alerta é obrigatório" },
        { status: 400 },
      );
    }

    // Excluir configuração de alerta
    const { error } = await supabase
      .from("contract_alerts")
      .delete()
      .eq("id", alertId);

    if (error) {
      console.error("Erro ao excluir alerta:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro na API de alertas:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
