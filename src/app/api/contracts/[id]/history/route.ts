import { createClient } from "../../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Retrieve modification history for a contract
export async function GET(
  request: NextRequest,
  { params }: { params: { contractId: string } },
) {
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

    // Get URL parameters for pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get contract history with user information
    const {
      data: history,
      error,
      count,
    } = await supabase
      .from("contract_history")
      .select(
        "id, action, details, ip_address, created_at, user_id, users:user_id(full_name, email)",
        { count: "exact" },
      )
      .eq("contract_id", params.contractId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching history:", error);
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 },
      );
    }

    // Format the history entries for better readability
    const formattedHistory = history.map((entry) => {
      let actionDescription = "";
      switch (entry.action) {
        case "contract_created":
          actionDescription = "Contract created";
          break;
        case "contract_updated":
          actionDescription = "Contract updated";
          break;
        case "contract_signed":
          actionDescription = "Contract signed";
          break;
        case "attachment_added":
          actionDescription = `Attachment added: ${entry.details?.file_name || ""}`;
          break;
        case "attachment_deleted":
          actionDescription = `Attachment deleted: ${entry.details?.file_name || ""}`;
          break;
        case "comment_added":
          actionDescription = "Comment added";
          break;
        case "comment_deleted":
          actionDescription = "Comment deleted";
          break;
        default:
          actionDescription = entry.action.replace(/_/g, " ");
      }

      return {
        ...entry,
        actionDescription,
      };
    });

    return NextResponse.json({
      history: formattedHistory,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        pages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (err) {
    console.error("Unexpected error in history API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// POST: Add a history entry (internal use only)
export async function POST(
  request: NextRequest,
  { params }: { params: { contractId: string } },
) {
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
    const { action, details } = await request.json();

    if (!action || typeof action !== "string") {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 },
      );
    }

    // Insert history entry
    const { data: historyEntry, error } = await supabase
      .from("contract_history")
      .insert({
        contract_id: params.contractId,
        user_id: user.id,
        action,
        details: details || {},
        ip_address: request.headers.get("x-forwarded-for") || request.ip,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding history entry:", error);
      return NextResponse.json(
        { error: "Failed to add history entry" },
        { status: 500 },
      );
    }

    return NextResponse.json({ historyEntry });
  } catch (err) {
    console.error("Unexpected error in history add API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
