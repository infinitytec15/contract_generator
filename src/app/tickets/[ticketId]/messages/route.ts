import { createClient } from "../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } },
) {
  const supabase = createClient();
  const ticketId = params.ticketId;

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

  // Get the ticket to check ownership
  const { data: ticket } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  // If not admin, check if the ticket belongs to the user
  if (!isAdmin && ticket?.user_id !== user.id) {
    return NextResponse.json(
      { error: "You don't have permission to view this ticket" },
      { status: 403 },
    );
  }

  // Get all messages for the ticket
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*, users(email, full_name)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { ticketId: string } },
) {
  const supabase = createClient();
  const ticketId = params.ticketId;

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
    if (!body.message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Get the ticket to check ownership or admin status
    const { data: ticket } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
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

    // If not admin, check if the ticket belongs to the user
    if (!isAdmin && ticket.user_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to reply to this ticket" },
        { status: 403 },
      );
    }

    // Create message
    const { data: message, error } = await supabase
      .from("ticket_messages")
      .insert([
        {
          ticket_id: ticketId,
          user_id: user.id,
          message: body.message,
          is_from_admin: isAdmin,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update ticket status based on who sent the message
    let newStatus = ticket.status;
    if (isAdmin) {
      newStatus = "responded"; // Admin responded
    } else {
      newStatus = "awaiting_response"; // User responded
    }

    // Only update if status changed
    if (newStatus !== ticket.status) {
      await supabase
        .from("tickets")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", ticketId);
    }

    // Create notification for the other party
    const notificationUserId = isAdmin ? ticket.user_id : null;
    const notificationTitle = isAdmin
      ? "Nova resposta no seu ticket"
      : "Nova mensagem em um ticket";
    const notificationMessage = isAdmin
      ? `Um administrador respondeu ao seu ticket: ${ticket.title}`
      : `O cliente respondeu ao ticket: ${ticket.title}`;

    if (notificationUserId) {
      // Notify the ticket owner if admin responded
      await supabase.from("notifications").insert([
        {
          user_id: notificationUserId,
          title: notificationTitle,
          message: notificationMessage,
          read: false,
          link: `/tickets/${ticketId}`,
        },
      ]);
    } else if (!isAdmin) {
      // Notify all admins if user responded
      const { data: adminUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("roles.name", ["admin", "super_admin"])
        .join("roles", { "user_roles.role_id": "roles.id" });

      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map((admin) => ({
          user_id: admin.user_id,
          title: notificationTitle,
          message: notificationMessage,
          read: false,
          link: `/admin/tickets/${ticketId}`,
        }));

        await supabase.from("notifications").insert(notifications);
      }
    }

    return NextResponse.json({ message: message[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 },
    );
  }
}
