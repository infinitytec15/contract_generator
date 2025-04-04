import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as OTPAuth from "otpauth";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export async function POST() {
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

    // Check if user already has 2FA enabled
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("two_factor_enabled")
      .eq("id", userId)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Erro ao verificar status de 2FA." },
        { status: 500 },
      );
    }

    if (userData.two_factor_enabled) {
      return NextResponse.json(
        { error: "Autenticação de dois fatores já está ativada." },
        { status: 400 },
      );
    }

    // Generate a new secret key
    const secret = OTPAuth.Secret.generate(20);
    const secretBase32 = secret.base32;

    // Create a new TOTP object
    const totp = new OTPAuth.TOTP({
      issuer: "VaultSystem",
      label: sessionData.user.email || "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });

    // Generate the TOTP URI for QR code
    const uri = totp.toString();

    // Store the secret in the temporary setup table
    const { error: setupError } = await supabaseClient
      .from("two_factor_setup")
      .upsert([
        {
          user_id: userId,
          secret: secretBase32,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        },
      ]);

    if (setupError) {
      return NextResponse.json(
        { error: "Erro ao configurar 2FA." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      qrCodeUri: uri,
      secret: secretBase32,
    });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json(
      { error: "Erro interno ao configurar 2FA." },
      { status: 500 },
    );
  }
}
