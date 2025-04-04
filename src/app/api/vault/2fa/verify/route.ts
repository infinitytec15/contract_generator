import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as OTPAuth from "otpauth";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: Request) {
  try {
    const { token, isSetup = false } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token é obrigatório." },
        { status: 400 },
      );
    }

    // Get the user session from cookies
    const cookieStore = cookies();
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    // Get session from cookie
    const supabaseAuthToken = cookieStore.get("supabase-auth-token")?.value;
    if (!supabaseAuthToken) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login novamente." },
        { status: 401 },
      );
    }

    // Parse the token to get the access token
    const parsedToken = JSON.parse(supabaseAuthToken);
    const accessToken = parsedToken[0];

    // Get user from session
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.getUser(accessToken);
    if (sessionError || !sessionData.user) {
      return NextResponse.json(
        { error: "Sessão inválida. Faça login novamente." },
        { status: 401 },
      );
    }

    const userId = sessionData.user.id;

    let secretBase32;

    if (isSetup) {
      // During setup, get the secret from the temporary setup table
      const { data: setupData, error: setupError } = await supabaseClient
        .from("two_factor_setup")
        .select("secret")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (setupError || !setupData) {
        return NextResponse.json(
          { error: "Configuração de 2FA não encontrada ou expirada." },
          { status: 400 },
        );
      }

      secretBase32 = setupData.secret;
    } else {
      // For normal verification, get the secret from the users table
      const { data: userData, error: userError } = await supabaseClient
        .from("users")
        .select("two_factor_secret, two_factor_enabled")
        .eq("id", userId)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: "Usuário não encontrado." },
          { status: 404 },
        );
      }

      if (!userData.two_factor_enabled || !userData.two_factor_secret) {
        return NextResponse.json(
          { error: "Autenticação de dois fatores não está ativada." },
          { status: 400 },
        );
      }

      secretBase32 = userData.two_factor_secret;
    }

    // Create a new TOTP object with the secret
    const totp = new OTPAuth.TOTP({
      issuer: "VaultSystem",
      label: sessionData.user.email || "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    // Verify the token
    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 400 },
      );
    }

    // If this is a setup verification and it's successful, enable 2FA for the user
    if (isSetup) {
      const { error: updateError } = await supabaseClient
        .from("users")
        .update({
          two_factor_secret: secretBase32,
          two_factor_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        return NextResponse.json(
          { error: "Erro ao ativar 2FA." },
          { status: 500 },
        );
      }

      // Clean up the temporary setup record
      await supabaseClient
        .from("two_factor_setup")
        .delete()
        .eq("user_id", userId);
    }

    return NextResponse.json({
      success: true,
      message: isSetup
        ? "Autenticação de dois fatores ativada com sucesso."
        : "Token verificado com sucesso.",
    });
  } catch (error) {
    console.error("Error verifying 2FA token:", error);
    return NextResponse.json(
      { error: "Erro interno ao verificar token 2FA." },
      { status: 500 },
    );
  }
}
