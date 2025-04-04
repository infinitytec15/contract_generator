"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const planId = formData.get("plan_id")?.toString() || null;
  const supabase = await createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        email: email,
        plan_id: planId,
      },
    },
  });

  console.log("After signUp", error);

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      // Insert user into users table
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        name: fullName,
        full_name: fullName,
        email: email,
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("Error updating user profile:", updateError);
      }

      // Get the client role ID
      const { data: clientRole } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "client")
        .single();

      if (clientRole) {
        // Assign client role to the new user
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: user.id,
          role_id: clientRole.id,
          created_at: new Date().toISOString(),
        });

        if (roleError) {
          console.error("Error assigning role to user:", roleError);
        }
      } else {
        console.error("Client role not found");
      }
    } catch (err) {
      console.error("Error in user profile creation:", err);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

// Client creation action
export const createClientAction = async (formData: FormData) => {
  const supabase = await createClient();

  // Get form data
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const phone = formData.get("phone")?.toString() || null;
  const document = formData.get("document")?.toString() || null;
  const address = formData.get("address")?.toString() || null;
  const city = formData.get("city")?.toString() || null;
  const state = formData.get("state")?.toString() || null;
  const postalCode = formData.get("postal_code")?.toString() || null;
  const planId = formData.get("plan_id")?.toString() || null;
  const notes = formData.get("notes")?.toString() || null;
  const userId = formData.get("user_id")?.toString();

  // Validate required fields
  if (!name || !email || !userId) {
    return encodedRedirect(
      "error",
      "/clients",
      "Nome, email e usuário responsável são obrigatórios",
    );
  }

  try {
    // Create client
    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        user_id: userId,
        name,
        email,
        phone,
        document,
        address,
        city,
        state,
        postal_code: postalCode,
        plan_id: planId,
        notes,
        status: "active",
        payment_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // If plan is selected, create initial payment record
    if (planId) {
      const { data: plan } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (plan) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 1);

        const { error: paymentError } = await supabase
          .from("client_payments")
          .insert({
            client_id: client.id,
            plan_id: planId,
            amount: plan.price,
            due_date: dueDate.toISOString(),
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (paymentError) throw paymentError;
      }
    }

    return encodedRedirect("success", "/clients", "Cliente criado com sucesso");
  } catch (err: any) {
    console.error("Erro ao criar cliente:", err);
    return encodedRedirect(
      "error",
      "/clients",
      `Erro ao criar cliente: ${err.message}`,
    );
  }
};

// Client update action
export const updateClientAction = async (formData: FormData) => {
  const supabase = await createClient();

  // Get form data
  const clientId = formData.get("client_id")?.toString();
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const phone = formData.get("phone")?.toString() || null;
  const document = formData.get("document")?.toString() || null;
  const address = formData.get("address")?.toString() || null;
  const city = formData.get("city")?.toString() || null;
  const state = formData.get("state")?.toString() || null;
  const postalCode = formData.get("postal_code")?.toString() || null;
  const planId = formData.get("plan_id")?.toString() || null;
  const notes = formData.get("notes")?.toString() || null;
  const status = formData.get("status")?.toString() || "active";
  const paymentStatus = formData.get("payment_status")?.toString() || "pending";

  // Validate required fields
  if (!clientId || !name || !email) {
    return encodedRedirect(
      "error",
      `/clients/${clientId}`,
      "ID do cliente, nome e email são obrigatórios",
    );
  }

  try {
    // Get current client data to check if plan changed
    const { data: currentClient } = await supabase
      .from("clients")
      .select("plan_id")
      .eq("id", clientId)
      .single();

    const planChanged = currentClient && currentClient.plan_id !== planId;

    // Update client
    const { error } = await supabase
      .from("clients")
      .update({
        name,
        email,
        phone,
        document,
        address,
        city,
        state,
        postal_code: postalCode,
        plan_id: planId,
        notes,
        status,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (error) throw error;

    // If plan changed and new plan is selected, create a payment record
    if (planChanged && planId) {
      const { data: plan } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (plan) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 1);

        const { error: paymentError } = await supabase
          .from("client_payments")
          .insert({
            client_id: clientId,
            plan_id: planId,
            amount: plan.price,
            due_date: dueDate.toISOString(),
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (paymentError) throw paymentError;
      }
    }

    return encodedRedirect(
      "success",
      `/clients/${clientId}`,
      "Cliente atualizado com sucesso",
    );
  } catch (err: any) {
    console.error("Erro ao atualizar cliente:", err);
    return encodedRedirect(
      "error",
      `/clients/${clientId}`,
      `Erro ao atualizar cliente: ${err.message}`,
    );
  }
};

// Contract template upload action
export const uploadContractTemplateAction = async (formData: FormData) => {
  const supabase = await createClient();

  // Get form data
  const name = formData.get("name")?.toString();
  const category = formData.get("category")?.toString();
  const description = formData.get("description")?.toString() || "";
  const file = formData.get("file") as File;

  // Validate required fields
  if (!name || !category || !file) {
    return encodedRedirect(
      "error",
      "/contracts/upload",
      "Name, category, and file are required",
    );
  }

  try {
    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `contract-templates/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("contracts")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading template:", uploadError);
      return encodedRedirect(
        "error",
        "/contracts/upload",
        "Failed to upload template file",
      );
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("contracts").getPublicUrl(filePath);

    // Process dynamic fields
    const fieldNames = formData
      .getAll("field_names[]")
      .map((f) => f.toString());
    const fieldLabels = formData
      .getAll("field_labels[]")
      .map((f) => f.toString());

    const dynamicFields = fieldNames
      .map((name, index) => ({
        name: name,
        label: fieldLabels[index] || name,
      }))
      .filter((field) => field.name);

    // Insert template record in database
    const { data: template, error: insertError } = await supabase
      .from("contract_templates")
      .insert({
        name,
        category,
        description,
        file_path: filePath,
        file_url: publicUrl,
        dynamic_fields: dynamicFields,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting template record:", insertError);
      return encodedRedirect(
        "error",
        "/contracts/upload",
        "Failed to save template information",
      );
    }

    return redirect(`/contracts/${template.id}/edit`);
  } catch (err) {
    console.error("Error in template upload process:", err);
    return encodedRedirect(
      "error",
      "/contracts/upload",
      "An unexpected error occurred",
    );
  }
};

// Update contract template action
export const updateContractTemplateAction = async (formData: FormData) => {
  const supabase = await createClient();

  // Get form data
  const templateId = formData.get("templateId")?.toString();
  const name = formData.get("name")?.toString();
  const category = formData.get("category")?.toString();
  const description = formData.get("description")?.toString() || "";
  const file = formData.get("file") as File | null;

  // Validate required fields
  if (!templateId || !name || !category) {
    return encodedRedirect(
      "error",
      `/contracts/${templateId}/edit`,
      "Name and category are required",
    );
  }

  try {
    let filePath = formData.get("current_file_path")?.toString() || "";
    let fileUrl = formData.get("current_file_url")?.toString() || "";

    // If a new file is uploaded, process it
    if (file && file.size > 0) {
      // Delete the old file if it exists
      if (filePath) {
        await supabase.storage.from("contracts").remove([filePath]);
      }

      // Upload the new file
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      filePath = `contract-templates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("contracts")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading template:", uploadError);
        return encodedRedirect(
          "error",
          `/contracts/${templateId}/edit`,
          "Failed to upload template file",
        );
      }

      // Get public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("contracts").getPublicUrl(filePath);

      fileUrl = publicUrl;
    }

    // Process dynamic fields
    const fieldNames = formData
      .getAll("field_names[]")
      .map((f) => f.toString());
    const fieldLabels = formData
      .getAll("field_labels[]")
      .map((f) => f.toString());

    const dynamicFields = fieldNames
      .map((name, index) => ({
        name: name,
        label: fieldLabels[index] || name,
      }))
      .filter((field) => field.name);

    // Update template record in database
    const updateData: any = {
      name,
      category,
      description,
      dynamic_fields: dynamicFields,
      updated_at: new Date().toISOString(),
    };

    // Only update file info if a new file was uploaded
    if (file && file.size > 0) {
      updateData.file_path = filePath;
      updateData.file_url = fileUrl;
    }

    const { error: updateError } = await supabase
      .from("contract_templates")
      .update(updateData)
      .eq("id", templateId);

    if (updateError) {
      console.error("Error updating template record:", updateError);
      return encodedRedirect(
        "error",
        `/contracts/${templateId}/edit`,
        "Failed to update template information",
      );
    }

    return encodedRedirect(
      "success",
      `/contracts/${templateId}/edit`,
      "Template updated successfully",
    );
  } catch (err) {
    console.error("Error in template update process:", err);
    return encodedRedirect(
      "error",
      `/contracts/${templateId}/edit`,
      "An unexpected error occurred",
    );
  }
};
