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

export async function createNotification(formData: FormData) {
  const admin = await requireAdmin();
  const title = (formData.get("title") as string | null)?.trim();
  const body = (formData.get("body") as string | null)?.trim();
  const recipientIds = formData.getAll("recipientIds") as string[];

  if (!title || !body || recipientIds.length === 0) return;

  const supabase = assertSupabaseAdmin();

  // Insert the notification
  const { data: notification, error: notifError } = await supabase
    .from("notifications")
    .insert({ title, body, created_by: admin.userId })
    .select("id")
    .single();

  if (notifError || !notification) {
    console.error("Failed to create notification:", notifError);
    return;
  }

  // Insert recipient rows
  const recipientRows = recipientIds.map((uid) => ({
    notification_id: notification.id,
    user_id: uid,
    is_read: false,
  }));

  const { error: recError } = await supabase
    .from("notification_recipients")
    .insert(recipientRows);

  if (recError) {
    console.error("Failed to insert recipients:", recError);
    // Roll back the notification
    await supabase.from("notifications").delete().eq("id", notification.id);
    return;
  }

  revalidatePath("/admin");
}

export async function deleteNotification(notificationId: string) {
  await requireAdmin();
  const supabase = assertSupabaseAdmin();
  // CASCADE deletes recipients automatically
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    console.error("Failed to delete notification:", error);
    return;
  }

  revalidatePath("/admin");
}
