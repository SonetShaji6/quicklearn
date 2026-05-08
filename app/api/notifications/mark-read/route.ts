import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";

// Runtime is handled globally by OpenNext/Cloudflare

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    const { notificationId } = await request.json();

    if (!notificationId) return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });

    const supabase = assertSupabaseAdmin();
    const { error } = await supabase
      .from("notification_recipients")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("notification_id", notificationId)
      .eq("user_id", payload.userId);

    if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
