import { createClient } from "../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Retrieve all integrations
export async function GET(request: NextRequest) {
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

    // Check if user has admin privileges
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "admin" || ur.roles?.name === "superadmin",
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Get URL parameters for filtering
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");

    // Build query
    let query = supabase.from("external_integrations").select("*");

    if (type) {
      query = query.eq("type", type);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Execute query
    const { data: integrations, error } = await query.order("name");

    if (error) {
      console.error("Error fetching integrations:", error);
      return NextResponse.json(
        { error: "Failed to fetch integrations" },
        { status: 500 },
      );
    }

    // Mask sensitive information
    const safeIntegrations = integrations.map((integration) => ({
      ...integration,
      api_secret: integration.api_secret ? "********" : null,
      webhook_secret: integration.webhook_secret ? "********" : null,
    }));

    return NextResponse.json({ integrations: safeIntegrations });
  } catch (err) {
    console.error("Unexpected error in integrations API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// POST: Create a new integration
export async function POST(request: NextRequest) {
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

    // Check if user has admin privileges
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "admin" || ur.roles?.name === "superadmin",
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Get request body
    const {
      name,
      type,
      api_key,
      api_secret,
      base_url,
      webhook_url,
      webhook_secret,
      settings,
    } = await request.json();

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 },
      );
    }

    // Insert integration
    const { data: integration, error } = await supabase
      .from("external_integrations")
      .insert({
        name,
        type,
        api_key: api_key || null,
        api_secret: api_secret || null,
        base_url: base_url || null,
        webhook_url: webhook_url || null,
        webhook_secret: webhook_secret || null,
        settings: settings || {},
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating integration:", error);
      return NextResponse.json(
        { error: "Failed to create integration" },
        { status: 500 },
      );
    }

    // Mask sensitive information
    const safeIntegration = {
      ...integration,
      api_secret: integration.api_secret ? "********" : null,
      webhook_secret: integration.webhook_secret ? "********" : null,
    };

    return NextResponse.json({ integration: safeIntegration });
  } catch (err) {
    console.error("Unexpected error in integration create API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// PUT: Update an integration
export async function PUT(request: NextRequest) {
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

    // Check if user has admin privileges
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "admin" || ur.roles?.name === "superadmin",
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Get request body
    const {
      id,
      name,
      type,
      api_key,
      api_secret,
      base_url,
      webhook_url,
      webhook_secret,
      settings,
      status,
    } = await request.json();

    // Validate required fields
    if (!id || !name || !type) {
      return NextResponse.json(
        { error: "ID, name, and type are required" },
        { status: 400 },
      );
    }

    // Get current integration to check if sensitive fields need updating
    const { data: currentIntegration, error: fetchError } = await supabase
      .from("external_integrations")
      .select("api_secret, webhook_secret")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching integration:", fetchError);
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

    // Prepare update data
    const updateData: any = {
      name,
      type,
      api_key: api_key || null,
      base_url: base_url || null,
      webhook_url: webhook_url || null,
      settings: settings || {},
      status: status || "active",
      updated_at: new Date().toISOString(),
    };

    // Only update secrets if they are provided and not masked
    if (api_secret && api_secret !== "********") {
      updateData.api_secret = api_secret;
    }

    if (webhook_secret && webhook_secret !== "********") {
      updateData.webhook_secret = webhook_secret;
    }

    // Update integration
    const { data: integration, error } = await supabase
      .from("external_integrations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating integration:", error);
      return NextResponse.json(
        { error: "Failed to update integration" },
        { status: 500 },
      );
    }

    // Mask sensitive information
    const safeIntegration = {
      ...integration,
      api_secret: integration.api_secret ? "********" : null,
      webhook_secret: integration.webhook_secret ? "********" : null,
    };

    return NextResponse.json({ integration: safeIntegration });
  } catch (err) {
    console.error("Unexpected error in integration update API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// DELETE: Delete an integration
export async function DELETE(request: NextRequest) {
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

    // Check if user has admin privileges
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "admin" || ur.roles?.name === "superadmin",
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Get integration ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 },
      );
    }

    // Delete integration
    const { error } = await supabase
      .from("external_integrations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting integration:", error);
      return NextResponse.json(
        { error: "Failed to delete integration" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in integration delete API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
