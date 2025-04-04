import { createClient } from "../../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Retrieve all comments for a contract
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

    // Get contract comments with user information
    const { data: comments, error } = await supabase
      .from("contract_comments")
      .select(
        "id, comment, created_at, updated_at, user_id, users:user_id(full_name, email)",
      )
      .eq("contract_id", params.contractId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 },
      );
    }

    return NextResponse.json({ comments });
  } catch (err) {
    console.error("Unexpected error in comments API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// POST: Add a new comment to a contract
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

    // Get request body
    const { comment } = await request.json();

    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 },
      );
    }

    // Insert comment
    const { data: newComment, error } = await supabase
      .from("contract_comments")
      .insert({
        contract_id: params.contractId,
        user_id: user.id,
        comment: comment.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        "id, comment, created_at, updated_at, user_id, users:user_id(full_name, email)",
      )
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return NextResponse.json(
        { error: "Failed to add comment" },
        { status: 500 },
      );
    }

    // Record in history
    await supabase.from("contract_history").insert({
      contract_id: params.contractId,
      user_id: user.id,
      action: "comment_added",
      details: { comment_id: newComment.id },
      ip_address: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json({ comment: newComment });
  } catch (err) {
    console.error("Unexpected error in comment add API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// DELETE: Remove a comment
export async function DELETE(
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

    // Get comment ID from URL
    const url = new URL(request.url);
    const commentId = url.searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 },
      );
    }

    // Check if the user is the comment author or has admin privileges
    const { data: comment, error: fetchError } = await supabase
      .from("contract_comments")
      .select("user_id")
      .eq("id", commentId)
      .eq("contract_id", params.contractId)
      .single();

    if (fetchError || !comment) {
      console.error("Error fetching comment:", fetchError);
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user is admin or comment author
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(
      (ur) => ur.roles?.name === "admin" || ur.roles?.name === "superadmin",
    );

    if (comment.user_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to delete this comment" },
        { status: 403 },
      );
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from("contract_comments")
      .delete()
      .eq("id", commentId)
      .eq("contract_id", params.contractId);

    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete comment" },
        { status: 500 },
      );
    }

    // Record in history
    await supabase.from("contract_history").insert({
      contract_id: params.contractId,
      user_id: user.id,
      action: "comment_deleted",
      details: { comment_id: commentId },
      ip_address: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in comment delete API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
