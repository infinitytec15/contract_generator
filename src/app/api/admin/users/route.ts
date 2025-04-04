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

    // Fetch users
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, full_name, created_at");

    if (error) {
      throw error;
    }

    // For each user, fetch their roles
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select(
            `
            role_id,
            roles(id, name)
          `,
          )
          .eq("user_id", user.id);

        if (rolesError) {
          throw rolesError;
        }

        return {
          ...user,
          roles: userRoles.map((ur) => ur.roles),
        };
      }),
    );

    return NextResponse.json(usersWithRoles);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
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
    const { email, password, full_name, roles } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 },
      );
    }

    // Create user in Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

    if (authError) {
      throw authError;
    }

    // Create user in users table
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      full_name,
      name: full_name,
      user_id: authData.user.id,
      token_identifier: authData.user.id,
      created_at: new Date().toISOString(),
    });

    if (userError) {
      throw userError;
    }

    // Assign roles to user
    if (roles && roles.length > 0) {
      const roleInserts = roles.map((roleId: string) => ({
        user_id: authData.user.id,
        role_id: roleId,
        created_at: new Date().toISOString(),
      }));

      const { error: rolesError } = await supabase
        .from("user_roles")
        .insert(roleInserts);

      if (rolesError) {
        throw rolesError;
      }
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 },
    );
  }
}
