export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { getSignedUrl } from "@/lib/azureStorage";
import { DashboardNav } from "./NavBar";
import { VideoClasses } from "./VideoClasses";
import MaterialsSection, { MaterialSection } from "./MaterialsSection";
import MockTestsSection, { MockAttempt, MockTest } from "./MockTestsSection";
import { SessionGuard } from "./SessionGuard";
import type { NotificationItem } from "./NotificationBell";

export const metadata = {
  title: "MCA RIT | Dashboard",
  description: "Your MCA RIT dashboard for MCA LBS crash course.",
};

type CategoryWithLessons = {
  id: string;
  name: string;
  description: string | null;
  lessons: { id: string; title: string; description: string | null; playback_id: string; duration: string | null; is_enabled?: boolean }[];
};

type MaterialRow = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  is_enabled?: boolean;
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
    created_at: string;
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

  let payload;
  try {
    payload = await verifyAuthToken(token);
  } catch {
    return redirect("/login?next=/dashboard");
  }

  if (payload.role === "admin") {
    return redirect("/admin");
  }

  if (payload.status !== "approved") {
    return redirect("/login?next=/dashboard");
  }

  const supabase = assertSupabaseAdmin();
  const { data: user } = await supabase
    .from("users")
    .select("name,college,degree,status,session_token")
    .eq("id", payload.userId)
    .single();

  if (!user || user.status !== "approved") {
    return redirect("/login?next=/dashboard");
  }

  // Single-device enforcement: if the session token in the JWT doesn't match
  // the one in the DB, it means the user logged in from another device.
  if (payload.sessionToken && user.session_token && payload.sessionToken !== user.session_token) {
    return redirect("/login?kicked=1");
  }

  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("id,name,description,lessons:lessons(*)")
    .order("created_at", { ascending: false });

  let categories = (categoriesRaw as CategoryWithLessons[] | null) ?? [];
  const othersIndex = categories.findIndex((c) => c.name.toLowerCase() === "others");
  if (othersIndex > 0) {
    const others = categories.splice(othersIndex, 1)[0];
    categories.unshift(others);
  }
  categories.forEach((c) => {
    if (c.lessons) {
      c.lessons = c.lessons.filter((l) => l.is_enabled !== false);
    }
  });

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
    .select("*")
    .order("created_at", { ascending: false });

  const materials = ((materialsRaw as MaterialRow[] | null) ?? []).filter((m) => m.is_enabled !== false);

  const filePaths = materials.map((m) => m.file_path);
  const fileMap = new Map<string, string>();

  if (filePaths.length > 0) {
    await Promise.all(
      filePaths.map(async (path) => {
        try {
          const signedUrl = await getSignedUrl("study-materials", path, 60); // 1 hour validity
          fileMap.set(path, signedUrl);
        } catch (err) {
          console.error(`Failed to generate SAS url for ${path}:`, err);
        }
      })
    );
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
      "id,title,category_id,duration_minutes,start_at,category:categories(name),questions:mock_questions(id,text,option_a,option_b,option_c,option_d,correct_index,created_at)"
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

  // ── Notifications ───────────────────────────────────────────────
  const { data: notifRaw } = await supabase
    .from("notification_recipients")
    .select("id,notification_id,is_read,created_at:notifications(created_at),notifications(title,body)")
    .eq("user_id", payload.userId)
    .order("created_at", { referencedTable: "notifications", ascending: false });

  type NotifRawRow = {
    id: string;
    notification_id: string;
    is_read: boolean;
    notifications: { title: string; body: string; created_at: string } | null;
  };

  const initialNotifications: NotificationItem[] = ((notifRaw ?? []) as unknown as NotifRawRow[])
    .map((row) => ({
      id: row.id,
      notification_id: row.notification_id,
      title: row.notifications?.title ?? "",
      body: row.notifications?.body ?? "",
      is_read: row.is_read,
      created_at: row.notifications?.created_at ?? "",
    })).filter((n) => n.title !== "");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SessionGuard />
      <DashboardNav userId={payload.userId} initialNotifications={initialNotifications} />

      <main className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-8 sm:px-6" id="overview">
        {/* ── Overview Section ───────────────────────────────── */}
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Welcome Card */}
          <div className="ql-card-static p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="section-label mb-2">Student Overview</p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                  Welcome back, {user.name || payload.email}
                </h1>
              </div>
              <span className="badge badge-success">Approved</span>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              {[
                { label: "Name", value: user.name },
                { label: "College", value: user.college },
                { label: "Degree", value: user.degree },
              ].map((item) => (
                <div key={item.label} className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-3 border border-[var(--border-subtle)]">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-[var(--text-secondary)]">Course Progress</span>
                <span className="text-[var(--ql-red)] font-black">{progressPct}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">Progress updates automatically as you finish lessons.</p>
            </div>
          </div>

          {/* Stats Card */}
          <div className="ql-card-static p-6 space-y-4">
            <p className="section-label">Summary</p>
            <div className="grid gap-3 grid-cols-2">
              {[
                { label: "Total Lessons", value: totalLessons, color: "var(--text-primary)" },
                { label: "Completed", value: completedCount, color: "var(--success)" },
                { label: "Remaining", value: remaining, color: "var(--warning)" },
                { label: "Progress", value: `${progressPct}%`, color: "var(--ql-red)" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-secondary)] p-4 text-center">
                  <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Video Classes Section ──────────────────────────── */}
        <section className="space-y-4" id="videos">
          <div>
            <p className="section-label mb-1">Video Classes</p>
            <p className="text-sm text-[var(--text-muted)]">Select a category, pick a lesson, and watch the embedded video.</p>
          </div>
          <VideoClasses completed={completedIds} categories={categories} />
        </section>

        {/* ── Materials Section ───────────────────────────────── */}
        <section className="space-y-4" id="materials">
          <MaterialsSection sections={materialSections} />
        </section>

        {/* ── Mock Tests Section ──────────────────────────────── */}
        <MockTestsSection tests={mockTests} attempts={mockAttempts} />
      </main>
    </div>
  );
}
