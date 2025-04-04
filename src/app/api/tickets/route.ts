import { createClient } from "../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the user is an admin
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select(
      `
      role_id,
      roles(name)
    `,
    )
    .eq("user_id", user.id);

  const isAdmin =
    userRoles &&
    userRoles.some(
      (ur) => ur.roles?.name === "admin" || ur.roles?.name === "super_admin",
    );

  let query = supabase.from("tickets").select("*");

  // If not admin, only show user's tickets
  if (!isAdmin) {
    query = query.eq("user_id", user.id);
  }

  // Get query parameters
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const department = url.searchParams.get("department");

  // Apply filters if provided
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (department) query = query.eq("department", department);

  // Order by created_at descending
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tickets: data });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 },
      );
    }

    // Create ticket
    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          user_id: user.id,
          title: body.title,
          description: body.description,
          department: body.department || "support", // Default to support
          priority: body.priority || "medium", // Default to medium
          status: "open", // Default status for new tickets
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create notification for admins
    const { data: adminUsers } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("roles.name", ["admin", "super_admin"])
      .join("roles", { "user_roles.role_id": "roles.id" });

    if (adminUsers && adminUsers.length > 0) {
      const notifications = adminUsers.map((admin) => ({
        user_id: admin.user_id,
        title: "Novo Ticket",
        message: `Um novo ticket foi criado: ${body.title}`,
        read: false,
        link: `/admin/tickets/${data[0].id}`,
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return NextResponse.json({ ticket: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 },
    );
  }
}
