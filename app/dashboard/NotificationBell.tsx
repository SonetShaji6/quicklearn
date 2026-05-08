"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type NotificationItem = {
  id: string;             // notification_recipients.id
  notification_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

interface NotificationBellProps {
  userId: string;
  initialNotifications: NotificationItem[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationBell({ userId, initialNotifications }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const [newPing, setNewPing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const knownIds = useRef<Set<string>>(new Set(initialNotifications.map((n) => n.notification_id)));
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Close on outside click ──────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ── Poll for new notifications (live delivery) ──────────────────
  // Uses a lightweight API call to check for new notifications every 15s.
  // Supabase Realtime requires Supabase Auth which this app doesn't use,
  // so polling is the reliable approach with custom JWTs.
  const pollNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/list", { method: "GET" });
      if (!res.ok) return;
      const data: NotificationItem[] = await res.json();

      // Find genuinely new ones
      const incoming = data.filter((n) => !knownIds.current.has(n.notification_id));
      if (incoming.length > 0) {
        incoming.forEach((n) => knownIds.current.add(n.notification_id));
        setNotifications(data); // replace with full fresh list (handles read state too)
        setNewPing(true);
        setTimeout(() => setNewPing(false), 3000);

        // Browser push notification for each new item
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          incoming.forEach((n) => {
            new Notification(n.title, {
              body: n.body,
              icon: "/favicon.ico",
              tag: n.notification_id,
            });
          });
        }
      } else {
        // Still update read state in case it changed elsewhere
        setNotifications(data);
      }
    } catch {
      // silently ignore network errors
    }
  }, []);

  useEffect(() => {
    // Start polling every 15 seconds for live updates
    pollIntervalRef.current = setInterval(pollNotifications, 15000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [pollNotifications]);

  // ── Mark a single notification as read ─────────────────────────
  const markRead = useCallback(async (item: NotificationItem) => {
    if (item.is_read) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
    );
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: item.notification_id }),
    });
  }, []);

  // ── Mark all as read ────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await Promise.all(
      unread.map((n) =>
        fetch("/api/notifications/mark-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: n.notification_id }),
        })
      )
    );
  }, [notifications]);

  // ── Request browser notification permission ─────────────────────
  const requestPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  return (
    <div className="relative" style={{ isolation: "isolate" }}>
      {/* Bell button */}
      <button
        ref={buttonRef}
        id="notification-bell-btn"
        onClick={() => {
          setOpen((v) => !v);
          requestPermission();
        }}
        className={`relative flex items-center justify-center w-8 h-8 rounded-[var(--radius)] transition-all duration-200 border
          ${open
            ? "bg-[var(--accent-light)] border-[var(--ql-red)]/30 text-[var(--ql-red)]"
            : "border-transparent text-[var(--text-tertiary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
          }`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        type="button"
      >
        {/* Bell icon */}
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${newPing ? "animate-[wiggle_0.5s_ease-in-out]" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[var(--ql-red)] text-white text-[10px] font-black leading-none shadow-sm ${newPing ? "animate-pulse-glow" : ""}`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification drawer panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 animate-overlay-in"
            style={{ background: "rgba(0,0,0,0.08)" }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xl)] animate-scale-in"
            style={{ maxHeight: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--text-primary)]">Notifications</span>
                {unreadCount > 0 && (
                  <span className="badge badge-red">{unreadCount} new</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-[var(--ql-red)] hover:underline"
                  type="button"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: "400px" }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--text-muted)]">
                  <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs text-center">You&apos;ll be notified here when the admin sends an update.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => markRead(notif)}
                      className={`w-full text-left px-4 py-3.5 transition-colors duration-150 hover:bg-[var(--surface-secondary)] ${
                        !notif.is_read ? "bg-[var(--accent-light)]" : ""
                      }`}
                      type="button"
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread dot */}
                        <div className={`mt-1.5 shrink-0 w-2 h-2 rounded-full transition-colors ${!notif.is_read ? "bg-[var(--ql-red)]" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-snug ${!notif.is_read ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--text-tertiary)] leading-relaxed line-clamp-3">{notif.body}</p>
                          <p className="mt-1.5 text-[10px] text-[var(--text-muted)] font-medium" suppressHydrationWarning>{timeAgo(notif.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] text-center">
                <p className="text-[11px] text-[var(--text-muted)]">
                  {notifications.length} total notification{notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
