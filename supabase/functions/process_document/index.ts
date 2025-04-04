import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();

    if (!documentId) {
      throw new Error("Document ID is required");
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get document details
    const { data: document, error: docError } = await supabase
      .from("vault_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      throw new Error(
        `Error fetching document: ${docError?.message || "Document not found"}`,
      );
    }

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("vault")
      .download(document.file_path);

    if (fileError || !fileData) {
      throw new Error(
        `Error downloading file: ${fileError?.message || "File not found"}`,
      );
    }

    // Mock OCR processing - in a real implementation, you would use a library like Tesseract
    // or call an external OCR API
    const mockExtractedText =
      `Sample extracted text from document ${document.name}\n` +
      `This is a simulated OCR result that would contain the actual text from the document.\n` +
      `It might include information like:\n` +
      `- CPF: 123.456.789-00\n` +
      `- Client Name: Example Client\n` +
      `- Expiration Date: 2025-12-31`;

    // Mock document classification based on filename and mock extracted text
    let documentType = "unknown";
    const tags = [];
    const fileName = document.name.toLowerCase();

    if (fileName.includes("rg") || fileName.includes("identidade")) {
      documentType = "RG";
      tags.push("personal", "identification");
    } else if (fileName.includes("cnh") || fileName.includes("habilitacao")) {
      documentType = "CNH";
      tags.push("personal", "identification", "driver");
    } else if (fileName.includes("contrato") || fileName.includes("contract")) {
      documentType = "Contract";
      tags.push("legal", "agreement");
    } else if (
      fileName.includes("nota") ||
      fileName.includes("nf") ||
      fileName.includes("invoice")
    ) {
      documentType = "Invoice";
      tags.push("financial", "tax");
    } else if (fileName.includes("procuracao") || fileName.includes("power")) {
      documentType = "Power of Attorney";
      tags.push("legal", "authorization");
    }

    // Determine suggested folder path based on document type
    const currentYear = new Date().getFullYear();
    let folderPath = `/${currentYear}/`;

    if (tags.includes("personal")) {
      folderPath += "Personal/";
    } else if (tags.includes("legal")) {
      folderPath += "Legal/";
    } else if (tags.includes("financial")) {
      folderPath += "Financial/";
    } else {
      folderPath += "Other/";
    }
    folderPath += documentType;

    // Update document with extracted information
    const { error: updateError } = await supabase
      .from("vault_documents")
      .update({
        extracted_text: mockExtractedText,
        document_type: documentType,
        tags: tags,
        folder_path: folderPath,
        ocr_processed: true,
        classification_processed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (updateError) {
      throw new Error(`Error updating document: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        documentType,
        tags,
        folderPath,
        message: "Document processed successfully",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
