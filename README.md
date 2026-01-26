## QuickLearn

Full-stack Next.js app for the MCA LBS crash course with Supabase-backed auth, content, and mock tests.

### Features
- Auth: signup with payment proof upload, JWT login, admin approval gate.
- Dashboard: video classes (YouTube URLs), study materials with signed URLs, lesson progress tracking.
- Mock tests: timed MCQs stored in Supabase (tests, questions, attempts). Students see detailed review; admins see all attempts with per-question choices and search.
- Admin: manage users, categories, lessons, materials, and mock tests.

### Quick start
```bash
npm install
npm run dev
```
App runs on http://localhost:3000. Use `/signup`, `/login`, `/dashboard`, `/admin`, `/admin/mock-tests`.

### Environment (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_SECRET=long-random-string-for-jwt
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Database (Supabase)
1) Run `docs/auth_schema.sql` to create `users`, `categories`, `lessons`, `lesson_progress`, `materials`.
2) Add mock test tables (run in SQL editor):
```sql
create extension if not exists "pgcrypto";

create table if not exists mock_tests (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	category_id uuid not null references categories(id) on delete cascade,
	duration_minutes integer not null check (duration_minutes > 0),
	start_at timestamptz not null,
	created_at timestamptz not null default now()
);

create table if not exists mock_questions (
	id uuid primary key default gen_random_uuid(),
	test_id uuid not null references mock_tests(id) on delete cascade,
	text text not null,
	option_a text not null,
	option_b text not null,
	option_c text not null,
	option_d text not null,
	correct_index smallint not null check (correct_index between 0 and 3),
	created_at timestamptz not null default now()
);

create table if not exists mock_attempts (
	test_id uuid not null references mock_tests(id) on delete cascade,
	user_id uuid not null references users(id) on delete cascade,
	answers integer[] not null default '{}',
	score integer not null default 0,
	total integer not null default 0,
	submitted_at timestamptz not null default now(),
	primary key (test_id, user_id)
);
```

### Storage buckets
- `payment-proofs` (private) — uploads during signup.
- `study-materials` (private) — files shown with signed URLs.

### Usage notes
- Lessons: store full YouTube URL in `lessons.playback_id`.
- Mock tests: create tests/questions at `/admin/mock-tests`; students take them on `/dashboard` and can review answers after submitting.
- RLS: keep writes through server actions (service role); students only read their data.

### Scripts
- `npm run dev` — local dev
- `npm run lint` — ESLint
- `npm run build` / `npm start` — production build & serve

### Tech
- Next.js 16 (App Router), TypeScript, Tailwind, Supabase JS, JWT auth, server actions, Plyr for media.
