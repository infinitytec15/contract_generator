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

    // Fetch roles
    const { data: roles, error } = await supabase
      .from("roles")
      .select("*")
      .order("name");

    if (error) {
      throw error;
    }

    return NextResponse.json(roles);
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch roles" },
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
    const { name, permissions } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 },
      );
    }

    // Create role
    const { data: role, error } = await supabase
      .from("roles")
      .insert({
        name,
        permissions: permissions || {},
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
      role,
    });
  } catch (error: any) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create role" },
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
    const { id, name, permissions } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 },
      );
    }

    // Check if trying to edit super_admin role
    const { data: roleData } = await supabase
      .from("roles")
      .select("name")
      .eq("id", id)
      .single();

    if (roleData?.name === "super_admin") {
      return NextResponse.json(
        { error: "Cannot edit super_admin role" },
        { status: 403 },
      );
    }

    // Update role
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name) {
      updateData.name = name;
    }

    if (permissions) {
      updateData.permissions = permissions;
    }

    const { data: role, error } = await supabase
      .from("roles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      role,
    });
  } catch (error: any) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update role" },
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

    // Get role ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 },
      );
    }

    // Check if trying to delete default roles
    const { data: roleData } = await supabase
      .from("roles")
      .select("name")
      .eq("id", id)
      .single();

    if (["super_admin", "admin", "client"].includes(roleData?.name)) {
      return NextResponse.json(
        { error: "Cannot delete default roles" },
        { status: 403 },
      );
    }

    // Check if role is assigned to any users
    const { data: roleUsers } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role_id", id);

    if (roleUsers && roleUsers.length > 0) {
      return NextResponse.json(
        {
          error: `Role is assigned to ${roleUsers.length} user(s) and cannot be deleted`,
        },
        { status: 400 },
      );
    }

    // Delete role
    const { error } = await supabase.from("roles").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete role" },
      { status: 500 },
    );
  }
}
