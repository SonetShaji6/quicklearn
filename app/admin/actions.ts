"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { verifyAuthToken } from "@/lib/auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const payload = await verifyAuthToken(token);
  if (payload.role !== "admin") throw new Error("Unauthorized");
  return payload;
}

export async function approveUser(userId: string) {
  await requireAdmin();
  const supabase = assertSupabaseAdmin();
  await supabase.from("users").update({ status: "approved" }).eq("id", userId);
  revalidatePath("/admin");
}

export async function rejectUser(userId: string) {
  await requireAdmin();
  const supabase = assertSupabaseAdmin();
  await supabase.from("users").update({ status: "rejected" }).eq("id", userId);
  revalidatePath("/admin");
}
