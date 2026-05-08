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

/**
 * Import questions from a JSON file.
 *
 * Expected JSON format – an array of objects:
 * [
 *   {
 *     "text": "What is ...?",
 *     "option_a": "...",
 *     "option_b": "...",
 *     "option_c": "...",
 *     "option_d": "...",
 *     "correct_index": 0          // 0=A, 1=B, 2=C, 3=D
 *   }
 * ]
 */
export async function importQuestionsFromJson(formData: FormData) {
  await requireAdmin();
  const testId = (formData.get("testId") as string | null)?.trim();
  const file = formData.get("jsonFile") as File | null;

  if (!testId || !file) return { error: "Missing test ID or file." };

  let questions: Array<{
    text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_index: number;
  }>;

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { error: "JSON must be an array of question objects." };
    questions = parsed;
  } catch {
    return { error: "Invalid JSON file." };
  }

  // Validate each question
  const rows = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.text || !q.option_a || !q.option_b || !q.option_c || !q.option_d) {
      return { error: `Question ${i + 1} is missing required fields (text, option_a–d).` };
    }
    const ci = Number(q.correct_index);
    if (isNaN(ci) || ci < 0 || ci > 3) {
      return { error: `Question ${i + 1} has invalid correct_index (must be 0–3).` };
    }
    rows.push({
      test_id: testId,
      text: String(q.text).trim(),
      option_a: String(q.option_a).trim(),
      option_b: String(q.option_b).trim(),
      option_c: String(q.option_c).trim(),
      option_d: String(q.option_d).trim(),
      correct_index: ci,
    });
  }

  if (rows.length === 0) return { error: "No questions found in the file." };

  const supabase = assertSupabaseAdmin();
  const { error } = await supabase.from("mock_questions").insert(rows);
  if (error) {
    console.error("Import error:", error);
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/admin/mock-tests");
  revalidatePath("/dashboard");
  return { success: `Imported ${rows.length} questions successfully.` };
}

