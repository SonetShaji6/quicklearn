import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import type { NotificationItem } from "@/app/dashboard/NotificationBell";

// Runtime is handled globally by OpenNext/Cloudflare

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json([], { status: 401 });

    const payload = await verifyAuthToken(token);
    const supabase = assertSupabaseAdmin();

    const { data, error } = await supabase
      .from("notification_recipients")
      .select("id,notification_id,is_read,notifications(title,body,created_at)")
      .eq("user_id", payload.userId)
      .order("created_at", { referencedTable: "notifications", ascending: false });

    if (error || !data) return NextResponse.json([]);

    type RawRow = {
      id: string;
      notification_id: string;
      is_read: boolean;
      notifications: { title: string; body: string; created_at: string } | null;
    };

    const notifications: NotificationItem[] = (data as unknown as RawRow[])
      .map((row) => ({
        id: row.id,
        notification_id: row.notification_id,
        title: row.notifications?.title ?? "",
        body: row.notifications?.body ?? "",
        is_read: row.is_read,
        created_at: row.notifications?.created_at ?? "",
      }))
      .filter((n) => n.title !== "");

    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json([], { status: 401 });
  }
}
