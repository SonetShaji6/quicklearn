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

export async function createMockTest(formData: FormData) {
  await requireAdmin();
  const title = (formData.get("title") as string | null)?.trim();
  const categoryId = (formData.get("categoryId") as string | null)?.trim();
  const duration = Number(formData.get("durationMinutes")) || 0;
  const startAt = (formData.get("startAt") as string | null)?.trim();

  if (!title || !categoryId || !startAt || duration <= 0) return;

  const supabase = assertSupabaseAdmin();
  const { error } = await supabase.from("mock_tests").insert({
    title,
    category_id: categoryId,
    duration_minutes: duration,
    start_at: new Date(startAt).toISOString(),
  });
  if (error) return;
  revalidatePath("/admin/mock-tests");
  revalidatePath("/dashboard");
}

export async function addMockQuestion(formData: FormData) {
  await requireAdmin();
  const testId = (formData.get("testId") as string | null)?.trim();
  const text = (formData.get("text") as string | null)?.trim();
  const optionA = (formData.get("optionA") as string | null)?.trim();
  const optionB = (formData.get("optionB") as string | null)?.trim();
  const optionC = (formData.get("optionC") as string | null)?.trim();
  const optionD = (formData.get("optionD") as string | null)?.trim();
  const correctIndex = Number(formData.get("correctIndex")) || 0;

  if (!testId || !text || !optionA || !optionB || !optionC || !optionD) return;
  if (correctIndex < 0 || correctIndex > 3) return;

  const supabase = assertSupabaseAdmin();
  const { error } = await supabase.from("mock_questions").insert({
    test_id: testId,
    text,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,
    correct_index: correctIndex,
  });
  if (error) return;
  revalidatePath("/admin/mock-tests");
  revalidatePath("/dashboard");
}

export async function deleteMockTest(testId: string) {
  await requireAdmin();
  const supabase = assertSupabaseAdmin();
  await supabase.from("mock_questions").delete().eq("test_id", testId);
  await supabase.from("mock_tests").delete().eq("id", testId);
  revalidatePath("/admin/mock-tests");
  revalidatePath("/dashboard");
}
