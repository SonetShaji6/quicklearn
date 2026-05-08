export const dynamic = "force-dynamic";

import Link from "next/link";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { getSignedUrl } from "@/lib/azureStorage";
import { approveUser, rejectUser } from "./actions";
import { createCategory, updateCategory, deleteCategory, createVideo, createMaterial, toggleLessonVisibility, toggleMaterialVisibility } from "./contentActions";
import { createNotification, deleteNotification } from "./notificationActions";
import NotificationAdminPanel from "./NotificationAdminPanel";

export const metadata = {
  title: "MCA RIT | Admin",
  description: "Admin dashboard to review MCA LBS registrations and payment proofs.",
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  status: string;
  payment_proof: string | null;
  created_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
  description: string | null;
  lesson_count: number;
  material_count: number;
};

type LessonRow = {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  playback_id: string;
  is_enabled?: boolean;
};

type MaterialRow = {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  file_path: string;
  is_enabled?: boolean;
};

type ApprovedUser = {
  id: string;
  name: string;
  email: string;
};

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  recipient_count: number;
};

async function getUsersWithProofUrls() {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase
    .from("users")
    .select("id,name,email,phone,college,degree,status,payment_proof,created_at")
    .order("created_at", { ascending: false });

  const users: UserRow[] = data || [];

  const proofPaths = users
    .map((u) => u.payment_proof)
    .filter((p): p is string => typeof p === "string" && p.length > 0);

  const pathMap = new Map<string, string>();

  if (proofPaths.length > 0) {
    // Generate SAS URLs for Azure Blob Storage
    await Promise.all(
      proofPaths.map(async (path) => {
        try {
          const signedUrl = await getSignedUrl("payment-proofs", path, 600); // 10 minutes validity
          pathMap.set(path, signedUrl);
        } catch (err) {
          console.error(`Failed to generate SAS url for ${path}:`, err);
        }
      })
    );
  }

  return users.map((user) => ({
    ...user,
    signedUrl: user.payment_proof ? pathMap.get(user.payment_proof) ?? null : null,
  }));
}

async function getCategoriesWithCounts(): Promise<CategoryRow[]> {
  const supabase = assertSupabaseAdmin();
  const defaults = ["Computer Science", "Mathematics", "Aptitude", "English", "Others"];
  const { data: existingNames } = await supabase.from("categories").select("name");
  const existingSet = new Set((existingNames || []).map((r: { name: string }) => r.name));
  const missing = defaults.filter((d) => !existingSet.has(d));
  if (missing.length) {
    await supabase.from("categories").insert(missing.map((name) => ({ name })));
  }

  const { data: categories } = await supabase.from("categories").select("id,name,description").order("created_at", { ascending: false });
  const rows = categories || [];

  // Optimization: Fetch all relationships in just 2 queries instead of N*2 queries
  const { data: allLessons } = await supabase.from("lessons").select("category_id");
  const { data: allMaterials } = await supabase.from("materials").select("category_id");

  // Count lessons per category in memory
  const lessonCounts = (allLessons || []).reduce((acc: Record<string, number>, item: { category_id: string }) => {
    const id = item.category_id;
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count materials per category in memory
  const materialCounts = (allMaterials || []).reduce((acc: Record<string, number>, item: { category_id: string }) => {
    const id = item.category_id;
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return rows.map((cat: { id: string; name: string; description?: string | null }) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description ?? null,
    lesson_count: lessonCounts[cat.id] || 0,
    material_count: materialCounts[cat.id] || 0,
  }));
}

async function getLessons(): Promise<LessonRow[]> {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as LessonRow[]) || [];
}

async function getMaterials(): Promise<MaterialRow[]> {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as MaterialRow[]) || [];
}

async function getApprovedStudents(): Promise<ApprovedUser[]> {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase
    .from("users")
    .select("id,name,email")
    .eq("status", "approved")
    .order("name", { ascending: true });
  return (data as ApprovedUser[]) || [];
}

async function getNotifications(): Promise<NotificationRow[]> {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase
    .from("notifications")
    .select("id,title,body,created_at")
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) return [];

  // Count recipients per notification
  const { data: recipients } = await supabase
    .from("notification_recipients")
    .select("notification_id");

  const counts = (recipients || []).reduce((acc: Record<string, number>, r: { notification_id: string }) => {
    acc[r.notification_id] = (acc[r.notification_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (data as Array<{ id: string; title: string; body: string; created_at: string }>).map((n) => ({
    ...n,
    recipient_count: counts[n.id] || 0,
  }));
}

export default async function AdminPage() {
  const [users, categories, lessons, materials, approvedStudents, notifications] = await Promise.all([
    getUsersWithProofUrls(),
    getCategoriesWithCounts(),
    getLessons(),
    getMaterials(),
    getApprovedStudents(),
    getNotifications(),
  ]);

  // Group lessons and materials by category
  const lessonsByCategory = new Map<string, LessonRow[]>();
  for (const l of lessons) {
    if (!lessonsByCategory.has(l.category_id)) lessonsByCategory.set(l.category_id, []);
    lessonsByCategory.get(l.category_id)!.push(l);
  }

  const materialsByCategory = new Map<string, MaterialRow[]>();
  for (const m of materials) {
    if (!materialsByCategory.has(m.category_id)) materialsByCategory.set(m.category_id, []);
    materialsByCategory.get(m.category_id)!.push(m);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 text-slate-900">
      {/* ── HEADER ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Admin dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Registrations & Content</h1>
            <p className="text-sm text-slate-600">Manage users, videos, and materials.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/users"
              className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs sm:text-sm font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100"
            >
              User Management
            </Link>
            <Link
              href="/admin/mock-tests"
              className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs sm:text-sm font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100"
            >
              Mock tests
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 transition hover:border-indigo-100 hover:bg-indigo-50/60 hover:text-indigo-700"
            >
              Back to site
            </Link>
          </div>
        </div>
      </div>

      {/* ── NOTIFICATIONS ───────────────────────────────────────── */}
      <NotificationAdminPanel
        approvedStudents={approvedStudents}
        notifications={notifications}
        createNotification={createNotification}
        deleteNotification={deleteNotification}
      />

      {/* ── USERS TABLE ─────────────────────────────────────── */}
      <div className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-lg shadow-indigo-50">
        {/* Desktop header */}
        <div className="hidden lg:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Name / Email / Phone</span>
          <span>College / Degree</span>
          <span>Status</span>
          <span>Payment Proof</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-slate-100">
          {users.length === 0 && (
            <div className="p-4 text-sm text-slate-600">No registrations yet.</div>
          )}
          {users.map((user) => {
            const approve = approveUser.bind(null, user.id);
            const reject = rejectUser.bind(null, user.id);
            return (
              <div key={user.id} className="p-4">
                {/* Desktop layout */}
                <div className="hidden lg:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] items-center gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-600">{user.email}</p>
                    <p className="text-xs text-slate-500">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-800">{user.college}</p>
                    <p className="text-xs text-slate-600">{user.degree}</p>
                  </div>
                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : user.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {user.status}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">{new Date(user.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    {user.signedUrl ? (
                      <a className="text-indigo-700 underline underline-offset-4 text-sm" href={user.signedUrl} target="_blank" rel="noreferrer">
                        View proof
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No file</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form action={approve}>
                      <button className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700" type="submit">
                        Approve
                      </button>
                    </form>
                    <form action={reject}>
                      <button className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600" type="submit">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="lg:hidden space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-600">{user.email}</p>
                      <p className="text-xs text-slate-500">{user.phone}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        user.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : user.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{user.college}</span> · {user.degree}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      {user.signedUrl ? (
                        <a className="text-indigo-700 underline underline-offset-4 text-xs" href={user.signedUrl} target="_blank" rel="noreferrer">
                          View proof
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No file</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <form action={approve}>
                        <button className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white" type="submit">Approve</button>
                      </form>
                      <form action={reject}>
                        <button className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white" type="submit">Reject</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CATEGORIES ──────────────────────────────────────── */}
      <div className="mx-auto mt-10 max-w-6xl rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-md shadow-indigo-50">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Manage categories</p>
          <p className="text-sm text-slate-600">Create, rename, or delete categories. Deletion is blocked if content exists.</p>
        </div>
        <form action={createCategory} className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="cat-name">Category name</label>
              <input id="cat-name" name="name" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g., Computer Science" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="cat-desc">Description (optional)</label>
              <input id="cat-desc" name="description" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Short note" />
            </div>
          </div>
          <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Create category</button>
        </form>

        <div className="mt-4 space-y-3">
          {categories.length === 0 && <p className="text-sm text-slate-600">No categories yet.</p>}
          {categories.map((cat) => {
            const update = updateCategory.bind(null, cat.id);
            const del = deleteCategory.bind(null, cat.id);
            const hasContent = cat.lesson_count + cat.material_count > 0;
            return (
              <div key={cat.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <form action={update} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input name="name" defaultValue={cat.name} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="rounded-full bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">{cat.lesson_count} lessons</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{cat.material_count} materials</span>
                    </div>
                  </div>
                  <textarea name="description" defaultValue={cat.description || ""} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Description" />
                  <div className="flex items-center gap-2">
                    <button type="submit" className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Save</button>
                    <button
                      formAction={async () => {
                        "use server";
                        await del();
                      }}
                      type="submit"
                      disabled={hasContent}
                      className="rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD VIDEO + ALL LESSONS BY CATEGORY ─────────────── */}
      <div className="mx-auto mt-10 max-w-6xl rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-md shadow-indigo-50">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Video lessons (YouTube)</p>
          <p className="text-sm text-slate-600">Add videos and manage visibility. Students only see enabled lessons.</p>
        </div>

        {/* Add video form */}
        <form
          action={async (formData) => {
            "use server";
            await createVideo(formData);
          }}
          className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select name="categoryId" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Lesson title</label>
              <input name="title" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">YouTube URL</label>
            <input name="youtubeUrl" type="url" placeholder="https://www.youtube.com/watch?v=..." required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Description (optional)</label>
            <textarea name="description" rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Add video</button>
        </form>

        {/* All lessons grouped by category */}
        <div className="mt-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">All lessons by category</p>
          {categories.map((cat) => {
            const catLessons = lessonsByCategory.get(cat.id) || [];
            if (catLessons.length === 0) return null;
            return (
              <div key={cat.id} className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">{catLessons.length} videos</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {catLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div className="min-w-0 overflow-hidden">
                        <p className="font-semibold text-slate-900 truncate">{lesson.title}</p>
                        <p className="text-xs text-slate-500 truncate">{lesson.playback_id}</p>
                      </div>
                      <form action={async () => {
                        "use server";
                        await toggleLessonVisibility(lesson.id, lesson.is_enabled !== false);
                      }}>
                        <button
                          type="submit"
                          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                            lesson.is_enabled !== false
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {lesson.is_enabled !== false ? "Enabled" : "Disabled"}
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {lessons.length === 0 && <p className="text-sm text-slate-600">No lessons yet.</p>}
        </div>
      </div>

      {/* ── UPLOAD MATERIAL + ALL MATERIALS BY CATEGORY ──── */}
      <div className="mx-auto mt-10 max-w-6xl rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-md shadow-indigo-50">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Study materials</p>
          <p className="text-sm text-slate-600">Upload PDFs/DOCX/ZIP and manage visibility per item.</p>
        </div>

        {/* Upload form */}
        <form
          action={async (formData) => {
            "use server";
            await createMaterial(formData);
          }}
          className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select name="categoryId" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Title</label>
              <input name="title" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Description (optional)</label>
            <textarea name="description" rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">File (PDF/DOCX/ZIP)</label>
            <input name="file" type="file" accept="application/pdf,.doc,.docx,.zip" required className="text-sm" />
          </div>
          <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Upload material</button>
        </form>

        {/* All materials grouped by category */}
        <div className="mt-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">All materials by category</p>
          {categories.map((cat) => {
            const catMaterials = materialsByCategory.get(cat.id) || [];
            if (catMaterials.length === 0) return null;
            return (
              <div key={cat.id} className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{catMaterials.length} files</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {catMaterials.map((mat) => (
                    <div key={mat.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div className="min-w-0 overflow-hidden">
                        <p className="font-semibold text-slate-900 truncate">{mat.title}</p>
                        <p className="text-xs text-slate-500 truncate">{mat.file_path}</p>
                      </div>
                      <form action={async () => {
                        "use server";
                        await toggleMaterialVisibility(mat.id, mat.is_enabled !== false);
                      }}>
                        <button
                          type="submit"
                          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                            mat.is_enabled !== false
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {mat.is_enabled !== false ? "Enabled" : "Disabled"}
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {materials.length === 0 && <p className="text-sm text-slate-600">No materials yet.</p>}
        </div>
      </div>
    </div>
  );
}
