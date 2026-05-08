# MCA RIT — MCA LBS Crash Course Platform

A full-stack Next.js web application for the MCA LBS entrance exam crash course. Built with Supabase, Azure Blob Storage, and deployed on Cloudflare Pages.

## ✨ Features

### 🎓 Student Dashboard
- **Video Classes** — YouTube-embedded video lessons organized by category with completion tracking
- **Study Materials** — Downloadable PDFs, DOCXs, ZIPs served via Azure Blob Storage signed URLs with in-browser preview
- **Mock Tests** — Timed MCQ assessments with instant scoring, detailed answer review, and localStorage-based progress persistence
- **Progress Tracking** — Visual progress bars, completion stats, and per-lesson checkmarks

### 🔐 Security
- **JWT Authentication** — Secure httpOnly cookie-based sessions with 7-day expiry
- **Single-Device Login** — Only one active session per account; logging in from a new device auto-kicks the previous one within ~15 seconds via real-time polling
- **Rate Limiting** — 3 failed login attempts locks the account for 1 hour
- **Admin Authorization** — Middleware-enforced admin-only routes with role-based JWT claims
- **Payment Verification** — Signup requires payment proof upload; admin must approve before access is granted

### 🛠️ Admin Panel
- **User Management** — Approve/reject registrations with payment proof viewing
- **Content Management** — Create categories, add YouTube video lessons, upload study materials
- **Visibility Control** — Enable/disable individual lessons and materials (students only see enabled content)
- **Mock Test Builder** — Create timed tests, add questions manually or bulk-import via JSON file
- **Student Attempts** — View all mock test submissions with per-question answer breakdowns and search

### 📱 Mobile Responsive
- Fully responsive design across all pages (signup, login, dashboard, admin)
- Mobile-optimized video player layout and horizontal category scrolling
- Card-based mobile layouts for admin user management

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000)

**Routes:** `/signup` · `/login` · `/dashboard` · `/admin` · `/admin/mock-tests`

## ⚙️ Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_SECRET=long-random-string-for-jwt
ADMIN_EMAILS=admin1@example.com,admin2@example.com
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
```

> ⚠️ `AUTH_SECRET` is mandatory — the app will throw an error if it's missing. Never use a default/fallback value.

## 🗄️ Database Schema (Supabase)

### 1. Run the base schema
Execute `docs/auth_schema.sql` to create core tables: `users`, `categories`, `lessons`, `lesson_progress`, `materials`.

### 2. Add mock test tables
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS mock_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  start_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mock_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_index smallint NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mock_attempts (
  test_id uuid NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers integer[] NOT NULL DEFAULT '{}',
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (test_id, user_id)
);
```

### 3. Add security & content control columns
```sql
-- Content visibility toggles
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT true;

-- Login rate limiting
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_login_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locked_until timestamptz DEFAULT NULL;

-- Single-device session enforcement
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS session_token text DEFAULT NULL;
```

## 📦 Storage

| Container | Access | Purpose |
|---|---|---|
| `payment-proofs` | Private | Payment screenshots uploaded during signup |
| `study-materials` | Private | PDFs/DOCXs served via time-limited SAS URLs |

## 📋 Mock Test JSON Import Format

Admins can bulk-import questions via JSON file at `/admin/mock-tests`:

```json
[
  {
    "text": "What is the capital of India?",
    "option_a": "Mumbai",
    "option_b": "Delhi",
    "option_c": "Chennai",
    "option_d": "Kolkata",
    "correct_index": 1
  }
]
```

`correct_index`: `0` = A, `1` = B, `2` = C, `3` = D

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Database | Supabase (PostgreSQL) |
| File Storage | Azure Blob Storage |
| Auth | JWT (jose) + bcryptjs |
| Video Player | Plyr (YouTube embed) |
| Hosting | Cloudflare Pages (via OpenNext adapter) |

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint check |
| `npm run deploy` | Build for Cloudflare Pages |

## 📁 Project Structure

```
app/
├── page.tsx              # Landing page
├── login/                # Login page + actions
├── signup/               # Signup page + actions
├── dashboard/            # Student dashboard
│   ├── VideoClasses.tsx   # Video player + lesson list
│   ├── MaterialsSection.tsx # Study materials with preview
│   ├── MockTestsSection.tsx # Timed mock test engine
│   ├── SessionGuard.tsx   # Real-time session polling
│   └── NavBar.tsx         # Dashboard navigation
├── admin/                # Admin panel
│   ├── mock-tests/        # Mock test management + JSON import
│   └── contentActions.ts  # Content visibility toggles
├── api/
│   └── session-check/     # Session validation endpoint
├── components/           # Shared components (Header, ThemeToggle, etc.)
└── layout.tsx            # Root layout with SEO metadata
lib/
├── auth.ts               # JWT creation/verification, password hashing
├── azureStorage.ts       # Azure Blob upload + SAS URL generation
├── env.ts                # Cloudflare/Node env variable resolver
└── supabaseClient.ts     # Supabase admin client
middleware.ts             # Admin route protection
```
