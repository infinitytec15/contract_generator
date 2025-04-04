import { createClient } from "../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/contracts/process-alerts
// Aciona manualmente o processamento de alertas de contratos
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação e permissões
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário é administrador
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
    }

    // Invocar a função Edge para processar alertas
    const { data, error } = await supabase.functions.invoke(
      "process_contract_alerts",
    );

    if (error) {
      console.error("Erro ao processar alertas:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Erro na API de processamento de alertas:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
