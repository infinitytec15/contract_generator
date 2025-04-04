import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export async function GET() {
  try {
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

    // Check if user has 2FA enabled
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("two_factor_enabled, two_factor_secret")
      .eq("id", userId)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Erro ao verificar status de 2FA." },
        { status: 500 },
      );
    }

    // Get the 2FA verification status from the request header
    const twoFactorVerified =
      cookieStore.get("vault-2fa-verified")?.value === "true";

    // If 2FA is enabled but not verified, require verification
    if (userData.two_factor_enabled && !twoFactorVerified) {
      return NextResponse.json(
        {
          error: "Verificação de dois fatores necessária.",
          requires2FA: true,
        },
        { status: 403 },
      );
    }

    // If we get here, the user is authorized to access the vault
    return NextResponse.json({
      success: true,
      message: "Acesso ao cofre autorizado.",
      requires2FA: userData.two_factor_enabled,
      is2FAVerified: twoFactorVerified,
    });
  } catch (error) {
    console.error("Error checking vault access:", error);
    return NextResponse.json(
      { error: "Erro interno ao verificar acesso ao cofre." },
      { status: 500 },
    );
  }
}
