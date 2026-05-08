-- Run this in Supabase Dashboard → SQL Editor

-- ── 1. Notifications table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Notification recipients table ────────────────────────────
CREATE TABLE IF NOT EXISTS notification_recipients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (notification_id, user_id)
);

-- ── 3. Indexes for fast lookups ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notif_recipients_user_id
  ON notification_recipients (user_id);

CREATE INDEX IF NOT EXISTS idx_notif_recipients_notification_id
  ON notification_recipients (notification_id);

-- ── Done ─────────────────────────────────────────────────────────
-- No RLS needed — server-side queries use the service role key.
-- The notifications table uses cascade delete:
-- deleting a notification automatically removes all recipient rows.
