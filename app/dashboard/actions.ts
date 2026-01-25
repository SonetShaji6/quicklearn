"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { verifyAuthToken } from "@/lib/auth";

async function requireApprovedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");

  const payload = await verifyAuthToken(token);
  if (payload.status !== "approved") throw new Error("Unauthorized");
  return payload;
}

export async function markLessonComplete(lessonId: string) {
  const user = await requireApprovedUser();
  const supabase = assertSupabaseAdmin();

  await supabase
    .from("lesson_progress")
    .upsert({ user_id: user.userId, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() }, { onConflict: "user_id,lesson_id" });

  revalidatePath("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}
