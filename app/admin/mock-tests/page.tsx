import Link from "next/link";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { createMockTest, addMockQuestion, deleteMockTest } from "./actions";

type MockTestRow = {
  id: string;
  title: string;
  category_id: string;
  duration_minutes: number;
  start_at: string;
};

type MockQuestionRow = {
  id: string;
  test_id: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index: number;
};

type CategoryRow = {
  id: string;
  name: string;
};

type AttemptRow = {
  test_id: string;
  user_id: string;
  answers: number[];
  score: number;
  total: number;
  submitted_at: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
  test: MockTestRow & { category: { name: string } | null; questions: MockQuestionRow[] } | null;
};

async function getCategories(): Promise<CategoryRow[]> {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase.from("categories").select("id,name").order("created_at", { ascending: true });
  return (data as CategoryRow[] | null) ?? [];
}

async function getMockTests(): Promise<Array<MockTestRow & { questions: MockQuestionRow[] }>> {
  const supabase = assertSupabaseAdmin();
  const { data: tests } = await supabase
    .from("mock_tests")
    .select(
      "id,title,category_id,duration_minutes,start_at,questions:mock_questions(id,test_id,text,option_a,option_b,option_c,option_d,correct_index)"
    )
    .order("created_at", { ascending: false });
  return (tests as Array<MockTestRow & { questions: MockQuestionRow[] }> | null) ?? [];
}

async function getMockAttempts(): Promise<AttemptRow[]> {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase
    .from("mock_attempts")
    .select(
      "test_id,user_id,answers,score,total,submitted_at,user:users(name,email),test:mock_tests(id,title,category:categories(name),questions:mock_questions(id,text,option_a,option_b,option_c,option_d,correct_index))"
    )
    .order("submitted_at", { ascending: false });
  return (data as AttemptRow[] | null) ?? [];
}

export default async function MockTestsAdminPage({ searchParams }: { searchParams: { q?: string } }) {
  const [tests, categories, attempts] = await Promise.all([getMockTests(), getCategories(), getMockAttempts()]);
  const fallbackCategoryId = categories[0]?.id ?? "";
  const query = (searchParams?.q ?? "").toLowerCase();

  const filteredAttempts = attempts.filter((att) => {
    if (!query) return true;
    const name = att.user?.name?.toLowerCase() ?? "";
    const email = att.user?.email?.toLowerCase() ?? "";
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Admin</p>
          <h1 className="text-3xl font-bold tracking-tight">Mock tests</h1>
          <p className="text-sm text-slate-600">Create timed MCQ mock tests stored securely in the database.</p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-100 hover:bg-indigo-50/60 hover:text-indigo-700"
        >
          Back to admin
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-6xl grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Create mock test</p>
          <form action={createMockTest} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Title</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  name="title"
                  required
                  placeholder="e.g., CS Aptitude Mock Test"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  name="categoryId"
                  defaultValue={fallbackCategoryId}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Duration (minutes)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  name="durationMinutes"
                  defaultValue={30}
                  required
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Start date & time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  name="startAt"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Create mock test
            </button>
          </form>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Tests</p>
            <span className="text-xs text-slate-500">Stored locally</span>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {tests.length === 0 && <p className="text-sm text-slate-600">No mock tests yet.</p>}
            {tests.map((t) => (
              <div key={t.id} className="rounded-2xl border px-4 py-3 text-sm shadow-sm border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{t.title}</p>
                    <p className="text-xs text-slate-600">{categories.find((c) => c.id === t.category_id)?.name ?? ""}</p>
                    <p className="text-[11px] text-slate-500">Starts {new Date(t.start_at).toLocaleString()}</p>
                    <p className="text-[11px] text-slate-500">{t.duration_minutes} mins · {t.questions.length} questions</p>
                  </div>
                  <form action={async () => {
                    "use server";
                    await deleteMockTest(t.id);
                  }}>
                    <button
                      type="submit"
                      className="rounded-full bg-rose-500 px-3 py-1 text-[11px] font-semibold text-white"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tests.map((test) => (
        <div key={test.id} className="mx-auto mt-8 max-w-6xl grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Add question: {test.title}</p>
              <span className="text-xs text-slate-500">{test.questions.length} added</span>
            </div>
            <form action={addMockQuestion} className="space-y-3">
              <input type="hidden" name="testId" value={test.id} />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Question text</label>
                <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} name="text" required placeholder="Enter the question" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["A", "B", "C", "D"] as const).map((label) => (
                  <div key={label} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Option {label}</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" name={`option${label}`} required />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Correct option</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" name="correctIndex" defaultValue={0}>
                  <option value={0}>A</option>
                  <option value={1}>B</option>
                  <option value={2}>C</option>
                  <option value={3}>D</option>
                </select>
              </div>
              <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                Add question
              </button>
            </form>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm max-h-[520px] overflow-y-auto pr-1">
            {test.questions.length === 0 && <p className="text-sm text-slate-600">No questions yet.</p>}
            {test.questions.map((q, idx) => (
              <div key={q.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">Q{idx + 1}. {q.text}</p>
                </div>
                <div className="mt-2 space-y-1 text-xs text-slate-700">
                  {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, optIdx) => (
                    <p key={optIdx} className={optIdx === q.correct_index ? "font-semibold text-emerald-700" : ""}>
                      {String.fromCharCode(65 + optIdx)}. {opt}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mx-auto mt-10 max-w-6xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Student attempts</p>
            <p className="text-sm text-slate-600">View scores and selected options for each submission.</p>
          </div>
          <form className="flex items-center gap-2" method="get">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by student name or email"
              className="w-full min-w-[220px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Search
            </button>
          </form>
        </div>

        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {filteredAttempts.length === 0 && <p className="text-sm text-slate-600">No attempts found.</p>}

          {filteredAttempts.map((att) => {
            const test = att.test;
            if (!test) return null;
            const questions = (test.questions ?? []).sort((a, b) => a.id.localeCompare(b.id));
            const answers = att.answers ?? [];
            const userName = att.user?.name || att.user?.email || "Unknown";
            const userEmail = att.user?.email;
            return (
              <details key={`${att.test_id}-${att.user_id}`} className="rounded-2xl border border-slate-200 bg-slate-50">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900">{test.title}</p>
                    <p className="text-xs text-slate-600">
                      {userName}
                      {userEmail ? ` · ${userEmail}` : ""}
                    </p>
                    <p className="text-[11px] text-slate-500">Submitted {new Date(att.submitted_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1">Score {att.score}/{att.total}</span>
                  </div>
                </summary>

                <div className="divide-y divide-slate-200 border-t border-slate-200 bg-white">
                  {questions.map((q, idx) => {
                    const userPick = answers[idx];
                    const options = [q.option_a, q.option_b, q.option_c, q.option_d];
                    const userText = userPick != null && userPick >= 0 ? options[userPick] : null;
                    const correctText = options[q.correct_index];
                    const isCorrect = userPick === q.correct_index;
                    return (
                      <div key={q.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">Q{idx + 1}. {q.text}</p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {options.map((opt, optIdx) => {
                            const isUser = userPick === optIdx;
                            const isRight = q.correct_index === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                                  isRight
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : isUser
                                      ? "border-rose-200 bg-rose-50 text-rose-800"
                                      : "border-slate-200 bg-white"
                                }`}
                              >
                                <span className="font-semibold text-slate-700">{String.fromCharCode(65 + optIdx)}.</span>
                                <span>{opt}</span>
                                {isRight && <span className="ml-auto text-[11px] font-semibold text-emerald-700">Correct</span>}
                                {!isRight && isUser && <span className="ml-auto text-[11px] font-semibold text-rose-700">Chosen</span>}
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <p>Selected: {userText ? `${String.fromCharCode(65 + (userPick ?? 0))}. ${userText}` : "Not answered"}</p>
                          <p>Correct: {`${String.fromCharCode(65 + q.correct_index)}. ${correctText}`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
