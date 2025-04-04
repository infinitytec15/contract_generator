import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { uploadContractTemplateAction } from "@/app/actions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await uploadContractTemplateAction(formData);

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("Error in upload-contract API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload contract template" },
      { status: 500 },
    );
  }
}
