import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { DashboardNav } from "./NavBar";
import { VideoClasses } from "./VideoClasses";
import MaterialsSection, { MaterialSection } from "./MaterialsSection";
import MockTestsSection, { MockAttempt, MockTest } from "./MockTestsSection";

export const metadata = {
  title: "QuickLearn | Dashboard",
  description: "Your QuickLearn MCA LBS dashboard for MCA LBS crash course.",
};

type CategoryWithLessons = {
  id: string;
  name: string;
  description: string | null;
  lessons: { id: string; title: string; description: string | null; playback_id: string; duration: string | null }[];
};

type MaterialRow = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
};

type MockTestRow = {
  id: string;
  title: string;
  category_id: string;
  duration_minutes: number;
  start_at: string;
  category: { name: string } | null;
  questions: Array<{
    id: string;
    text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_index: number;
  }>;
};

const fallbackMaterialCategories: Array<Pick<CategoryWithLessons, "id" | "name" | "description" | "lessons">> = [
  { id: "cs", name: "Computer Science", description: null, lessons: [] },
  { id: "math", name: "Mathematics", description: null, lessons: [] },
  { id: "aptitude", name: "Aptitude", description: null, lessons: [] },
  { id: "english", name: "English", description: null, lessons: [] },
  { id: "others", name: "Others", description: null, lessons: [] },
];

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return redirect("/login?next=/dashboard");
  }

  const payload = await verifyAuthToken(token);
  if (payload.role === "admin") {
    return redirect("/admin");
  }

  if (payload.status !== "approved") {
    return redirect("/login?next=/dashboard");
  }

  const supabase = assertSupabaseAdmin();
  const { data: user } = await supabase
    .from("users")
    .select("name,college,degree,status")
    .eq("id", payload.userId)
    .single();

  if (!user || user.status !== "approved") {
    return redirect("/login?next=/dashboard");
  }

  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("id,name,description,lessons:lessons(id,title,description,playback_id,duration)")
    .order("created_at", { ascending: false });

  const categories = (categoriesRaw as CategoryWithLessons[] | null) ?? [];
  const lessons = categories.flatMap((c) => c.lessons ?? []);
  const totalLessons = lessons.length;

  const { data: progressRowsRaw } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", payload.userId);

  const progressRows = (progressRowsRaw ?? []) as Array<{ lesson_id: string; completed: boolean }>;
  const completedIds = progressRows.filter((row) => row.completed).map((row) => row.lesson_id);
  const completedCount = completedIds.length;
  const remaining = Math.max(totalLessons - completedCount, 0);
  const progressPct = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  const { data: materialsRaw } = await supabase
    .from("materials")
    .select("id,category_id,title,description,file_path,mime_type,size_bytes")
    .order("created_at", { ascending: false });

  const materials = (materialsRaw as MaterialRow[] | null) ?? [];

  const filePaths = materials.map((m) => m.file_path);
  const fileMap = new Map<string, string>();

  if (filePaths.length > 0) {
    const { data: signedData } = await supabase.storage
      .from("study-materials")
      .createSignedUrls(filePaths, 60 * 60);

    if (signedData) {
      signedData.forEach((item: { path: string | null; signedUrl: string }) => {
        if (item.path && item.signedUrl) {
          fileMap.set(item.path, item.signedUrl);
        }
      });
    }
  }

  const materialsWithUrls = materials.map((mat) => ({
    ...mat,
    signedUrl: fileMap.get(mat.file_path) ?? null,
  })) as (MaterialRow & { signedUrl: string | null })[];

  const materialsByCategory = new Map<string, Array<MaterialRow & { signedUrl: string | null }>>();
  for (const mat of materialsWithUrls) {
    if (!materialsByCategory.has(mat.category_id)) {
      materialsByCategory.set(mat.category_id, []);
    }
    materialsByCategory.get(mat.category_id)!.push(mat);
  }

  const materialSections: MaterialSection[] = (categories.length ? categories : fallbackMaterialCategories).map((cat) => ({
    id: cat.id,
    name: cat.name,
    materials: materialsByCategory.get(cat.id) ?? [],
  }));

  const { data: mockTestsRaw } = await supabase
    .from("mock_tests")
    .select(
      "id,title,category_id,duration_minutes,start_at,category:categories(name),questions:mock_questions(id,text,option_a,option_b,option_c,option_d,correct_index)"
    )
    .order("start_at", { ascending: false });

  const mockTests: MockTest[] = ((mockTestsRaw ?? []) as unknown as MockTestRow[]).map((t) => ({
    id: t.id,
    title: t.title,
    category_name: t.category?.name ?? "",
    duration_minutes: t.duration_minutes,
    start_at: t.start_at,
    questions: (t.questions ?? []).map((q) => ({
      id: q.id,
      text: q.text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_index: q.correct_index,
    })),
  }));

  const { data: mockAttemptsRaw } = await supabase
    .from("mock_attempts")
    .select("test_id,answers,score,total")
    .eq("user_id", payload.userId);

  const mockAttempts = (mockAttemptsRaw ?? []) as MockAttempt[];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <DashboardNav />

      <main className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-8 sm:px-6" id="overview">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-indigo-900/10">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">Student overview</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, {user.name || payload.email}</h1>
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 dark:text-slate-300">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Name</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">College</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.college}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Degree</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.degree}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-900/10">
                <p className="text-xs uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">Status</p>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Approved</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span>Overall course progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                  style={{ width: `${progressPct}%` }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Progress updates automatically as you finish lessons.</p>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-indigo-900/10">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">Summary</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Total lessons</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalLessons}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                <p className="text-xs uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">Completed</p>
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{completedCount}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
                <p className="text-xs uppercase tracking-[0.12em] text-amber-700 dark:text-amber-400">Remaining</p>
                <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{remaining}</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                <p className="text-xs uppercase tracking-[0.12em] text-indigo-700 dark:text-indigo-400">Status</p>
                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Approved student</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4" id="videos">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">Video Classes</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Select a category, pick a lesson, and watch the embedded YouTube video.</p>
            </div>
          </div>
          <VideoClasses completed={completedIds} categories={categories} />
        </section>

        <section className="space-y-4" id="materials">
          <MaterialsSection sections={materialSections} />
        </section>

        <MockTestsSection tests={mockTests} attempts={mockAttempts} />
      </main>
    </div>
  );
}
