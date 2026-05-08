"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { createAuthToken, verifyPassword } from "@/lib/auth";
import { getEnvSync } from "@/lib/env";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour

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
    .select("id, email, password, status, failed_login_attempts, locked_until")
    .eq("email", email)
    .single();

  if (error || !user) {
    return { success: false, message: "Invalid credentials." };
  }

  // ── Rate limiting: check if account is locked ──────────────
  const failedAttempts = (user.failed_login_attempts as number) ?? 0;
  const lockedUntil = user.locked_until ? new Date(user.locked_until as string).getTime() : 0;
  const now = Date.now();

  if (lockedUntil > now) {
    const minutesLeft = Math.ceil((lockedUntil - now) / 60000);
    return {
      success: false,
      message: `Account is temporarily locked. Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
    };
  }

  // If lock has expired, reset the counter
  if (lockedUntil > 0 && lockedUntil <= now) {
    await supabase
      .from("users")
      .update({ failed_login_attempts: 0, locked_until: null })
      .eq("id", user.id);
  }

  // ── Verify password ────────────────────────────────────────
  const passwordOk = await verifyPassword(password, user.password as string);
  if (!passwordOk) {
    // Only reset the counter if a real lock existed and has now expired
    const lockExpired = lockedUntil > 0 && lockedUntil <= now;
    const newCount = (lockExpired ? 0 : failedAttempts) + 1;
    const updates: Record<string, unknown> = { failed_login_attempts: newCount };

    if (newCount >= MAX_FAILED_ATTEMPTS) {
      updates.locked_until = new Date(now + LOCKOUT_DURATION_MS).toISOString();
      updates.failed_login_attempts = newCount;
      await supabase.from("users").update(updates).eq("id", user.id);
      return {
        success: false,
        message: "Too many failed attempts. Your account has been locked for 1 hour.",
      };
    }

    await supabase.from("users").update(updates).eq("id", user.id);
    const remaining = MAX_FAILED_ATTEMPTS - newCount;
    return {
      success: false,
      message: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining before lockout.`,
    };
  }

  // ── Check account status ───────────────────────────────────
  if (user.status === "pending") {
    return { success: false, message: "Your payment is under verification. Please wait for admin approval." };
  }

  if (user.status !== "approved") {
    return { success: false, message: "Account is not approved." };
  }

  // ── Generate unique session token (single-device enforcement) ──
  const sessionToken = crypto.randomUUID();

  // Store session token in DB (invalidates any previous session)
  await supabase
    .from("users")
    .update({
      failed_login_attempts: 0,
      locked_until: null,
      session_token: sessionToken,
    })
    .eq("id", user.id);

  // ── Create JWT with session token embedded ─────────────────
  const adminEmailsStr = getEnvSync("ADMIN_EMAILS");
  const ADMIN_EMAILS = adminEmailsStr.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = ADMIN_EMAILS.includes(email);
  const token = await createAuthToken({
    userId: user.id,
    email: user.email,
    status: user.status,
    role: isAdmin ? "admin" : "student",
    sessionToken,
  });

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
