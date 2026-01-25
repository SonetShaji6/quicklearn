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


export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  if (!name) return;

  const supabase = assertSupabaseAdmin();
  const { error } = await supabase.from("categories").insert({ name, description });
  if (error) return;

  revalidatePath("/admin");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  if (!name) return;

  const supabase = assertSupabaseAdmin();
  const { error } = await supabase.from("categories").update({ name, description }).eq("id", categoryId);
  if (error) return;
  revalidatePath("/admin");
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const supabase = assertSupabaseAdmin();

  const { count: lessonCount } = await supabase.from("lessons").select("id", { count: "exact", head: true }).eq("category_id", categoryId);
  const { count: materialCount } = await supabase.from("materials").select("id", { count: "exact", head: true }).eq("category_id", categoryId);
  if ((lessonCount || 0) > 0 || (materialCount || 0) > 0) return;

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return;
  revalidatePath("/admin");
}

export async function createVideo(formData: FormData) {
  await requireAdmin();
  const categoryId = (formData.get("categoryId") as string | null)?.trim();
  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const youtubeUrl = (formData.get("youtubeUrl") as string | null)?.trim();

  if (!categoryId || !title || !youtubeUrl) return;

  // Basic validation for a YouTube URL (keep simple to avoid heavy deps)
  try {
    const url = new URL(youtubeUrl);
    if (!/(youtube.com|youtu.be)$/.test(url.hostname)) return;
  } catch {
    return;
  }

  const supabase = assertSupabaseAdmin();
  const { error } = await supabase.from("lessons").insert({
    category_id: categoryId,
    title,
    description,
    playback_id: youtubeUrl,
  });

  if (error) return;

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function createMaterial(formData: FormData) {
  await requireAdmin();
  const categoryId = (formData.get("categoryId") as string | null)?.trim();
  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const file = formData.get("file") as File | null;

  if (!categoryId || !title || !file) return;

  if (file.size <= 0) return;
  if (file.size > 50 * 1024 * 1024) return;

  const supabase = assertSupabaseAdmin();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = file.name.split(".").pop();
  const filePath = `materials/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("study-materials")
    .upload(filePath, buffer, { contentType: file.type || "application/octet-stream", upsert: false });

  if (uploadError) return;

  const { error } = await supabase.from("materials").insert({
    category_id: categoryId,
    title,
    description,
    file_path: filePath,
    mime_type: file.type,
    size_bytes: file.size,
  });

  if (error) return;

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
