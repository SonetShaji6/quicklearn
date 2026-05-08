"use client";

import { useState, useTransition } from "react";

type ApprovedUser = { id: string; name: string; email: string };
type NotificationRow = { id: string; title: string; body: string; created_at: string; recipient_count: number };

interface Props {
  approvedStudents: ApprovedUser[];
  notifications: NotificationRow[];
  createNotification: (formData: FormData) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
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

export default function NotificationAdminPanel({ approvedStudents, notifications, createNotification, deleteNotification }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, startSending] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = approvedStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected = filteredStudents.length > 0 && filteredStudents.every((s) => selected.has(s.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredStudents.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredStudents.forEach((s) => next.add(s.id));
        return next;
      });
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSend() {
    if (!title.trim() || !body.trim() || selected.size === 0) return;
    startSending(async () => {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("body", body.trim());
      selected.forEach((id) => fd.append("recipientIds", id));
      await createNotification(fd);
      setTitle("");
      setBody("");
      setSelected(new Set());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startDeleting(async () => {
      await deleteNotification(id);
      setDeletingId(null);
    });
  }

  return (
    <div className="mx-auto mt-8 max-w-6xl space-y-6">
      {/* ── COMPOSE NOTIFICATION ── */}
      <div className="rounded-2xl sm:rounded-3xl border border-indigo-100 bg-white p-4 sm:p-6 shadow-md shadow-indigo-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Send Notification</p>
            <p className="text-xs text-slate-500">Compose and deliver a message to selected students instantly.</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 font-medium">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Notification sent successfully!
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700" htmlFor="notif-title">Notification Title</label>
            <input
              id="notif-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              placeholder="e.g., Class schedule update"
            />
          </div>

          {/* Body */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700" htmlFor="notif-body">Message</label>
            <textarea
              id="notif-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none"
              placeholder="Write your message to students..."
            />
          </div>

          {/* Student selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Recipients</label>
              <span className="text-xs text-slate-500 font-medium">
                {selected.size} of {approvedStudents.length} selected
              </span>
            </div>

            {approvedStudents.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm text-slate-500">No approved students yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                {/* Search + Select All row */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students…"
                    className="flex-1 text-xs rounded-md border border-slate-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                      allSelected
                        ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {/* Student list */}
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 bg-white">
                  {filteredStudents.length === 0 && (
                    <p className="px-4 py-4 text-xs text-slate-500 text-center">No students match your search.</p>
                  )}
                  {filteredStudents.map((student) => (
                    <label
                      key={student.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm ${
                        selected.has(student.id) ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(student.id)}
                        onChange={() => toggle(student.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 w-3.5 h-3.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{student.name}</p>
                        <p className="text-xs text-slate-500 truncate">{student.email}</p>
                      </div>
                      {selected.has(student.id) && (
                        <span className="shrink-0 text-[10px] font-bold text-indigo-600 bg-indigo-100 rounded-full px-2 py-0.5">Selected</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send button */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              id="send-notification-btn"
              onClick={handleSend}
              disabled={sending || !title.trim() || !body.trim() || selected.size === 0}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send to {selected.size > 0 ? `${selected.size} student${selected.size > 1 ? "s" : ""}` : "students"}
                </>
              )}
            </button>
            {selected.size === 0 && (
              <p className="text-xs text-slate-500">Select at least one student to send.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── MANAGE PAST NOTIFICATIONS ── */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-md shadow-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Sent Notifications</p>
            <p className="text-xs text-slate-500">All notifications you&apos;ve sent. Delete to remove from all recipients.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {notifications.length} total
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
            <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm font-medium">No notifications sent yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 truncate">{notif.title}</p>
                    <span className="shrink-0 text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded-full px-2 py-0.5">
                      {notif.recipient_count} recipient{notif.recipient_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{notif.body}</p>
                  <p className="mt-1 text-[11px] text-slate-400 font-medium" suppressHydrationWarning>{timeAgo(notif.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(notif.id)}
                  disabled={deleting && deletingId === notif.id}
                  className="shrink-0 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                >
                  {deleting && deletingId === notif.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
