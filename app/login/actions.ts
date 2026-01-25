"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { createAuthToken, verifyPassword } from "@/lib/auth";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string | null)?.toLowerCase().trim();
  const password = formData.get("password") as string | null;
  const redirectTo = (formData.get("redirectTo") as string | null)?.trim();

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  const supabase = assertSupabaseAdmin();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, password, status")
    .eq("email", email)
    .single();

  if (error || !user) {
    return { success: false, message: "Invalid credentials." };
  }

  const passwordOk = await verifyPassword(password, user.password as string);
  if (!passwordOk) {
    return { success: false, message: "Invalid credentials." };
  }

  if (user.status === "pending") {
    return { success: false, message: "Your payment is under verification. Please wait for admin approval." };
  }

  if (user.status !== "approved") {
    return { success: false, message: "Account is not approved." };
  }

  const isAdmin = ADMIN_EMAILS.includes(email);
  const token = await createAuthToken({ userId: user.id, email: user.email, status: user.status, role: isAdmin ? "admin" : "student" });

  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  const destination = redirectTo || (isAdmin ? "/admin" : "/dashboard");
  redirect(destination);
}
