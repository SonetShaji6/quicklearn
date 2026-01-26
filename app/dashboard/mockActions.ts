"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";

export async function submitMockAttempt(testId: string, answers: number[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const payload = await verifyAuthToken(token);

  const supabase = assertSupabaseAdmin();

  const { data: test } = await supabase
    .from("mock_tests")
    .select("id,duration_minutes,start_at,questions:mock_questions(id,correct_index)")
    .eq("id", testId)
    .single();
  if (!test) throw new Error("Test not found");

  const correct = (test.questions ?? []).reduce((acc: number, q: { correct_index: number }, idx: number) => {
    return acc + (answers[idx] === q.correct_index ? 1 : 0);
  }, 0);

  const total = (test.questions ?? []).length;

  await supabase
    .from("mock_attempts")
    .upsert({
      test_id: testId,
      user_id: payload.userId,
      answers,
      score: correct,
      total,
      submitted_at: new Date().toISOString(),
    }, { onConflict: "test_id,user_id" });

  revalidatePath("/dashboard");
}
