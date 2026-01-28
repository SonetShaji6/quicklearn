"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { hashPassword, verifyAuthToken } from "@/lib/auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const payload = await verifyAuthToken(token);
  if (payload.role !== "admin") throw new Error("Unauthorized");
  return payload;
}

export async function updateUserAction(formData: FormData) {
  try {
    await requireAdmin();
    
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const college = formData.get("college") as string;
    const degree = formData.get("degree") as string;
    const phone = formData.get("phone") as string;
    const status = formData.get("status") as string;
    const password = formData.get("password") as string;

    if (!userId) return { success: false, message: "User ID is required" };

    const updates: Record<string, string> = {
      name,
      college,
      degree,
      phone,
      status
    };

    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return { success: false, message: "Password must be at least 6 characters" };
      }
      updates.password = await hashPassword(password);
    }

    const supabase = assertSupabaseAdmin();
    const { error } = await supabase.from("users").update(updates).eq("id", userId);

    if (error) throw error;

    revalidatePath("/admin/users");
    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, message: "Failed to update user" };
  }
}
