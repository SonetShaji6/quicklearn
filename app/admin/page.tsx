import Link from "next/link";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { approveUser, rejectUser } from "./actions";
import { createCategory, updateCategory, deleteCategory, createVideo, createMaterial } from "./contentActions";

export const metadata = {
  title: "QuickLearn | Admin",
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
};

type MaterialRow = {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  file_path: string;
};

async function getUsersWithProofUrls() {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase
    .from("users")
    .select("id,name,email,phone,college,degree,status,payment_proof,created_at")
    .order("created_at", { ascending: false });

  const users: UserRow[] = data || [];

  const signedUrls = await Promise.all(
    users.map(async (u) => {
      if (!u.payment_proof) return null;
      const { data: urlData } = await supabase.storage.from("payment-proofs").createSignedUrl(u.payment_proof, 600);
      return urlData?.signedUrl || null;
    })
  );

  return users.map((user, idx) => ({ ...user, signedUrl: signedUrls[idx] }));
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

  const counts = await Promise.all(
    rows.map(async (cat: { id: string; name: string; description?: string | null }) => {
      const { count: lessonCount } = await supabase.from("lessons").select("id", { count: "exact", head: true }).eq("category_id", cat.id);
      const { count: materialCount } = await supabase.from("materials").select("id", { count: "exact", head: true }).eq("category_id", cat.id);
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description ?? null,
        lesson_count: lessonCount || 0,
        material_count: materialCount || 0,
      } satisfies CategoryRow;
    })
  );

  return counts;
}

async function getLessons(): Promise<LessonRow[]> {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase
    .from("lessons")
    .select("id,title,description,category_id,playback_id")
    .order("created_at", { ascending: false });
  return (data as LessonRow[]) || [];
}

async function getMaterials(): Promise<MaterialRow[]> {
  const supabase = assertSupabaseAdmin();
  const { data } = await supabase
    .from("materials")
    .select("id,title,description,category_id,file_path")
    .order("created_at", { ascending: false });
  return (data as MaterialRow[]) || [];
}

export default async function AdminPage() {
  const [users, categories, lessons, materials] = await Promise.all([
    getUsersWithProofUrls(),
    getCategoriesWithCounts(),
    getLessons(),
    getMaterials(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Admin dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">Registrations & payment verification</h1>
          <p className="text-sm text-slate-600">Approve only after validating the uploaded payment proof.</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-100 hover:bg-indigo-50/60 hover:text-indigo-700"
        >
          Back to site
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-indigo-50">
        <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
              <div key={user.id} className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] items-center gap-3 px-4 py-4 text-sm">
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
                  <p className="text-[11px] text-slate-500">Submitted {new Date(user.created_at).toLocaleString()}</p>
                </div>
                <div>
                  {user.signedUrl ? (
                    <a
                      className="text-indigo-700 underline underline-offset-4"
                      href={user.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View proof
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">No file</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={approve}>
                    <button
                      className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      type="submit"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={reject}>
                    <button
                      className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600"
                      type="submit"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-indigo-50">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Manage categories</p>
            <p className="text-sm text-slate-600">Create, rename, or delete categories. Deletion is blocked if content exists.</p>
          </div>
          <form action={createCategory} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="cat-name">Category name</label>
              <input id="cat-name" name="name" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g., Computer Science" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="cat-desc">Description (optional)</label>
              <textarea id="cat-desc" name="description" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={2} placeholder="Short note" />
            </div>
            <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Create category</button>
          </form>

          <div className="space-y-3">
            {categories.length === 0 && <p className="text-sm text-slate-600">No categories yet.</p>}
            {categories.map((cat) => {
              const update = updateCategory.bind(null, cat.id);
              const del = deleteCategory.bind(null, cat.id);
              const hasContent = cat.lesson_count + cat.material_count > 0;
              return (
                <div key={cat.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <form action={update} className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-[2fr_1fr] sm:items-center">
                      <input name="name" defaultValue={cat.name} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
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

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-indigo-50">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Add video lesson (YouTube)</p>
            <p className="text-sm text-slate-600">Provide a YouTube URL; it will be stored and embedded for students.</p>
          </div>
          <form
            action={async (formData) => {
              "use server";
              await createVideo(formData);
            }}
            className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
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
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Description (optional)</label>
              <textarea name="description" rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">YouTube URL</label>
              <input name="youtubeUrl" type="url" placeholder="https://www.youtube.com/watch?v=..." required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Add video</button>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Recent lessons</p>
            <div className="space-y-2">
              {lessons.slice(0, 5).map((lesson) => (
                <div key={lesson.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <p className="font-semibold text-slate-900">{lesson.title}</p>
                  <p className="text-xs text-slate-600">Playback ID: {lesson.playback_id}</p>
                </div>
              ))}
              {lessons.length === 0 && <p className="text-sm text-slate-600">No lessons yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Study materials</p>
            <p className="text-sm text-slate-600">Upload PDFs/DOCX/ZIP to private storage and link to categories.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            action={async (formData) => {
              "use server";
              await createMaterial(formData);
            }}
            className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
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

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Recent materials</p>
            <div className="space-y-2">
              {materials.slice(0, 6).map((mat) => (
                <div key={mat.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <p className="font-semibold text-slate-900">{mat.title}</p>
                  <p className="text-xs text-slate-600">Path: {mat.file_path}</p>
                </div>
              ))}
              {materials.length === 0 && <p className="text-sm text-slate-600">No materials yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
