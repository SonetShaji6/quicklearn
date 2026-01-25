-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  phone text not null,
  college text not null,
  degree text not null,
  payment_proof text,
  status text not null default 'pending', -- pending | approved | rejected
  created_at timestamptz not null default now()
);

-- Track per-user lesson completion
create table if not exists public.lesson_progress (
  user_id uuid references public.users(id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

-- Storage bucket for payment proofs (private)
-- Run in the Supabase SQL editor or CLI:
-- select storage.create_bucket('payment-proofs', public => false);

-- RLS
alter table public.users enable row level security;

-- Students can view only their own row
create policy "Students can view their own row"
  on public.users for select
  using (auth.uid() = id);

-- Students can update only their own row (if ever needed for profile)
create policy "Students can update their own row"
  on public.users for update
  using (auth.uid() = id);

-- Insert policy for service role only (signups use service key via server action)
create policy "Service role inserts"
  on public.users for insert
  with check (true);

-- Admin role can update status
create policy "Admins can update status"
  on public.users for update
  using (auth.role() = 'service_role');

-- Storage policies: only service role (admin actions) can access payment proofs
create policy "Service role read payment proofs"
  on storage.objects for select
  using (bucket_id = 'payment-proofs' and auth.role() = 'service_role');

create policy "Service role upload payment proofs"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and auth.role() = 'service_role');

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- Lessons (Mux)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  description text,
  asset_id text,
  playback_id text not null,
  duration text,
  created_at timestamptz not null default now()
);

-- Track per-user lesson completion
create table if not exists public.lesson_progress (
  user_id uuid references public.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

-- Study materials (files stored in Supabase storage bucket "study-materials")
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  description text,
  file_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- Storage bucket for study materials (private)
-- select storage.create_bucket('study-materials', public => false);

-- RLS for new tables (service role will be used by server actions)
alter table public.categories enable row level security;
alter table public.lessons enable row level security;
alter table public.materials enable row level security;
alter table public.lesson_progress enable row level security;

-- Service role full access
create policy "service role categories" on public.categories for all using (auth.role() = 'service_role');
create policy "service role lessons" on public.lessons for all using (auth.role() = 'service_role');
create policy "service role materials" on public.materials for all using (auth.role() = 'service_role');
create policy "service role lesson_progress" on public.lesson_progress for all using (auth.role() = 'service_role');

-- Students can read lessons and materials
create policy "students read lessons" on public.lessons for select using (true);
create policy "students read materials" on public.materials for select using (true);

-- Students read their own progress
create policy "students read own progress" on public.lesson_progress for select using (auth.uid() = user_id);

-- Students update their own progress (optional; server role primarily writes)
create policy "students update own progress" on public.lesson_progress for update using (auth.uid() = user_id);
