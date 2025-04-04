import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and has super_admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has super_admin role
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(
        `
        role_id,
        roles(name)
      `,
      )
      .eq("user_id", user.id);

    const isSuperAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "super_admin",
    );

    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch plans
    const { data: plans, error } = await supabase
      .from("plans")
      .select("*")
      .order("price");

    if (error) {
      throw error;
    }

    return NextResponse.json(plans);
  } catch (error: any) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plans" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and has super_admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has super_admin role
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(
        `
        role_id,
        roles(name)
      `,
      )
      .eq("user_id", user.id);

    const isSuperAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "super_admin",
    );

    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const {
      name,
      description,
      price,
      billing_cycle,
      features,
      contract_uploads_limit,
      client_limit,
      contract_links_limit,
      signature_limit,
      vault_storage_limit,
      trial_days,
      is_active,
    } = body;

    if (!name || !price || !billing_cycle) {
      return NextResponse.json(
        { error: "Name, price, and billing cycle are required" },
        { status: 400 },
      );
    }

    // Create plan
    const { data: plan, error } = await supabase
      .from("plans")
      .insert({
        name,
        description,
        price,
        billing_cycle,
        features: features || {},
        contract_uploads_limit: contract_uploads_limit || 10,
        client_limit: client_limit || 10,
        contract_links_limit: contract_links_limit || 20,
        signature_limit: signature_limit || 20,
        vault_storage_limit: vault_storage_limit || 104857600, // 100MB default
        trial_days: trial_days || 7,
        is_active: is_active !== undefined ? is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create plan" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and has super_admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has super_admin role
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(
        `
        role_id,
        roles(name)
      `,
      )
      .eq("user_id", user.id);

    const isSuperAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "super_admin",
    );

    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      billing_cycle,
      features,
      contract_uploads_limit,
      client_limit,
      contract_links_limit,
      signature_limit,
      vault_storage_limit,
      trial_days,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 },
      );
    }

    // Update plan
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (billing_cycle !== undefined) updateData.billing_cycle = billing_cycle;
    if (features !== undefined) updateData.features = features;
    if (contract_uploads_limit !== undefined)
      updateData.contract_uploads_limit = contract_uploads_limit;
    if (client_limit !== undefined) updateData.client_limit = client_limit;
    if (contract_links_limit !== undefined)
      updateData.contract_links_limit = contract_links_limit;
    if (signature_limit !== undefined)
      updateData.signature_limit = signature_limit;
    if (vault_storage_limit !== undefined)
      updateData.vault_storage_limit = vault_storage_limit;
    if (trial_days !== undefined) updateData.trial_days = trial_days;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: plan, error } = await supabase
      .from("plans")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update plan" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and has super_admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has super_admin role
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(
        `
        role_id,
        roles(name)
      `,
      )
      .eq("user_id", user.id);

    const isSuperAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "super_admin",
    );

    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get plan ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 },
      );
    }

    // Check if plan is assigned to any clients
    const { data: planClients } = await supabase
      .from("clients")
      .select("id")
      .eq("plan_id", id);

    if (planClients && planClients.length > 0) {
      return NextResponse.json(
        {
          error: `Plan is assigned to ${planClients.length} client(s) and cannot be deleted`,
        },
        { status: 400 },
      );
    }

    // Delete plan
    const { error } = await supabase.from("plans").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete plan" },
      { status: 500 },
    );
  }
}
