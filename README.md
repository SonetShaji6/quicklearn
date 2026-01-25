## QuickLearn Auth & Payments Setup

This project now includes secure signup, payment proof upload, admin approval, and status-gated login for the MCA LBS crash course.

### 1) Install dependencies
```bash
npm install
```

### 2) Environment variables (create `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_SECRET=long-random-string-for-jwt
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### 3) Database & storage (Supabase / Postgres)
- Run `docs/auth_schema.sql` in Supabase SQL editor to create the `users` table (now includes a `phone` column) and the new content tables: `categories`, `lessons` (stores YouTube video URL in `playback_id`), `lesson_progress`, and `materials`.
- Create **private** storage buckets named `payment-proofs` and `study-materials`.
- RLS is configured so only the service role (server actions) can write; students can read lessons/materials and only read their own progress.

### 4) Develop locally
```bash
npm run dev
```
Visit `/signup` to register with payment proof upload (stored privately) and `/login` to sign in. Accounts remain **pending** until an admin approves them.

### 5) Dashboard & video classes (YouTube)
- The student dashboard lives at `/dashboard` and is only accessible to approved users.
- Video classes now embed YouTube. Store the full YouTube URL in `lessons.playback_id` (e.g., `https://www.youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`).
- Lesson completion is stored per user in the `lesson_progress` table. Because YouTube iframes don't reliably emit an "ended" event, students can mark completion via the "Mark completed" button under the player.

### 6) Admin content management (YouTube + Supabase)
- Categories: create/edit/delete (deletes blocked if lessons/materials exist).
- Videos: add a YouTube URL, plus title/description, linked to a category. The URL is stored in `lessons.playback_id`.
- Materials: upload files (PDF/DOCX/ZIP, etc.) to the private `study-materials` bucket and link to a category.

### 5) Admin dashboard
- Go to `/admin` (protected by JWT + admin email allowlist).
- View registrants, open signed URLs for payment proofs, and approve/reject users. Only **approved** users can log in successfully.

### Notes
- Passwords are hashed with `bcryptjs`. Auth tokens are JWTs signed with `AUTH_SECRET` and stored in HTTP-only cookies.
- Payment proofs are uploaded via server actions using the Supabase service role key; proofs remain private and are exposed only through short-lived signed URLs for admins.
