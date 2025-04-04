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

    // Check for potential expiration date in the document content
    let expirationDate = document.expiration_date;
    if (!expirationDate) {
      // Try to extract expiration date from the text
      const expirationMatch = mockExtractedText.match(
        /Expiration Date: (\d{4}-\d{2}-\d{2})/i,
      );
      if (expirationMatch && expirationMatch[1]) {
        expirationDate = expirationMatch[1];
      }
    }

    // Calculate expiration status
    let isExpired = false;
    let daysUntilExpiration = null;

    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const today = new Date();
      isExpired = expDate < today;

      if (!isExpired) {
        const diffTime = Math.abs(expDate.getTime() - today.getTime());
        daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    // Update document with extracted information
    const { error: updateError } = await supabase
      .from("vault_documents")
      .update({
        extracted_text: mockExtractedText,
        document_type: documentType,
        tags: tags,
        folder_path: folderPath,
        expiration_date: expirationDate,
        is_expired: isExpired,
        days_until_expiration: daysUntilExpiration,
        ocr_processed: true,
        classification_processed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    // Create notification if document is expired or about to expire
    if (
      expirationDate &&
      (isExpired || (daysUntilExpiration !== null && daysUntilExpiration <= 30))
    ) {
      try {
        // Get document owner
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (userId) {
          // Create notification
          await supabase.from("notifications").insert({
            user_id: userId,
            title: isExpired
              ? "Documento Expirado"
              : "Documento Próximo da Expiração",
            message: isExpired
              ? `O documento "${document.name}" expirou em ${new Date(expirationDate).toLocaleDateString()}.`
              : `O documento "${document.name}" irá expirar em ${daysUntilExpiration} dias.`,
            type: isExpired ? "warning" : "info",
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Continue even if notification creation fails
      }
    }

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
        expirationDate,
        isExpired,
        daysUntilExpiration,
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
