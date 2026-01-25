"use server";

import { revalidatePath } from "next/cache";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { hashPassword } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

export async function signupAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.toLowerCase().trim();
  const password = formData.get("password") as string | null;
  const college = (formData.get("college") as string | null)?.trim();
  const degree = (formData.get("degree") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim();
  const file = formData.get("payment-proof") as File | null;

  if (!name || !email || !password || !college || !degree || !phone || !file) {
    return { success: false, message: "All fields including payment proof are required." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, message: "Payment proof must be PNG, JPG, JPEG, or PDF." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, message: "Payment proof must be under 5MB." };
  }

  const supabase = assertSupabaseAdmin();

  // Upload payment proof to private bucket
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = file.name.split(".").pop();
  const filePath = `payment-proofs/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { success: false, message: "Upload failed. Please try again." };
  }

  const hashed = await hashPassword(password);

  const { error: insertError } = await supabase.from("users").insert({
    name,
    email,
    password: hashed,
    college,
    degree,
    phone,
    payment_proof: filePath,
    status: "pending",
  });

  if (insertError) {
    const pgError = insertError as { code?: string };
    if (pgError.code === "23505") {
      return { success: false, message: "Email already registered." };
    }
    return { success: false, message: "Could not save your registration." };
  }

  revalidatePath("/signup");

  return {
    success: true,
    message: "Registration successful. Your account will be activated after payment verification.",
  };
}
