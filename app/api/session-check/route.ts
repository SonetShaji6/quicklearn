import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ valid: false, reason: "no_token" });
    }

    const payload = await verifyAuthToken(token);
    if (!payload.sessionToken) {
      // Old token without session tracking — still valid
      return NextResponse.json({ valid: true });
    }

    const supabase = assertSupabaseAdmin();
    const { data: user } = await supabase
      .from("users")
      .select("session_token")
      .eq("id", payload.userId)
      .single();

    if (!user) {
      return NextResponse.json({ valid: false, reason: "user_not_found" });
    }

    if (user.session_token && user.session_token !== payload.sessionToken) {
      return NextResponse.json({ valid: false, reason: "session_replaced" });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false, reason: "error" });
  }
}
