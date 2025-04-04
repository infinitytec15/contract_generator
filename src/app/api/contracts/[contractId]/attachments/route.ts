import { createClient } from "../../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Retrieve all attachments for a contract
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

    // Get contract attachments
    const { data: attachments, error } = await supabase
      .from("contract_attachments")
      .select(
        "id, file_name, file_path, file_url, file_type, file_size, description, created_at, uploaded_by, users:uploaded_by(full_name)",
      )
      .eq("contract_id", params.contractId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching attachments:", error);
      return NextResponse.json(
        { error: "Failed to fetch attachments" },
        { status: 500 },
      );
    }

    return NextResponse.json({ attachments });
  } catch (err) {
    console.error("Unexpected error in attachments API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// POST: Upload a new attachment for a contract
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const description = formData.get("description") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `contract-attachments/${params.contractId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("contracts")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading attachment:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload attachment" },
        { status: 500 },
      );
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("contracts").getPublicUrl(filePath);

    // Insert attachment record in database
    const { data: attachment, error: insertError } = await supabase
      .from("contract_attachments")
      .insert({
        contract_id: params.contractId,
        file_name: file.name,
        file_path: filePath,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        description: description || null,
        uploaded_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting attachment record:", insertError);
      // Try to delete the uploaded file if the database insert fails
      await supabase.storage.from("contracts").remove([filePath]);
      return NextResponse.json(
        { error: "Failed to save attachment information" },
        { status: 500 },
      );
    }

    // Record in history
    await supabase.from("contract_history").insert({
      contract_id: params.contractId,
      user_id: user.id,
      action: "attachment_added",
      details: { attachment_id: attachment.id, file_name: file.name },
      ip_address: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json({ attachment });
  } catch (err) {
    console.error("Unexpected error in attachment upload API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// DELETE: Remove an attachment
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

    // Get attachment ID from URL
    const url = new URL(request.url);
    const attachmentId = url.searchParams.get("attachmentId");

    if (!attachmentId) {
      return NextResponse.json(
        { error: "Attachment ID is required" },
        { status: 400 },
      );
    }

    // Get attachment details first to get the file path
    const { data: attachment, error: fetchError } = await supabase
      .from("contract_attachments")
      .select("file_path, file_name")
      .eq("id", attachmentId)
      .eq("contract_id", params.contractId)
      .single();

    if (fetchError || !attachment) {
      console.error("Error fetching attachment:", fetchError);
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from("contracts")
      .remove([attachment.file_path]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      // Continue anyway to delete the database record
    }

    // Delete the attachment record
    const { error: deleteError } = await supabase
      .from("contract_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("contract_id", params.contractId);

    if (deleteError) {
      console.error("Error deleting attachment record:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete attachment" },
        { status: 500 },
      );
    }

    // Record in history
    await supabase.from("contract_history").insert({
      contract_id: params.contractId,
      user_id: user.id,
      action: "attachment_deleted",
      details: { attachment_id: attachmentId, file_name: attachment.file_name },
      ip_address: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in attachment delete API:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
