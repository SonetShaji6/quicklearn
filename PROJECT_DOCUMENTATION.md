# QuickLearn Project Documentation

## 1. Overview
QuickLearn is a full-stack web application designed for an MCA LBS crash course. It provides a platform for students to access video classes, download study materials, and take mock tests. The application includes a comprehensive student dashboard and an administrative panel for managing content and users.

## 2. Architecture & Technology Stack
The project is built using a modern, serverless-friendly architecture:

*   **Framework:** Next.js 16 (App Router paradigm) with React 19.
*   **Language:** TypeScript for end-to-end type safety.
*   **Styling:** Tailwind CSS (v4) for utility-first styling, utilizing PostCSS.
*   **Database & Storage:** Supabase (PostgreSQL) is used as the primary database and object storage (for payment proofs and study materials).
*   **Authentication:** Custom JWT-based authentication using `jose` and `bcryptjs` for password hashing, integrated with Supabase for user records.
*   **Media Player:** `plyr` and `plyr-react` for custom-styled, embedded YouTube video playback.
*   **Deployment:** Designed to be deployed on platforms like Vercel (as indicated by recent commit history and Vercel-specific files).

## 3. Key Features

### 3.1 Authentication & Authorization
*   **Custom JWT Auth:** Instead of relying purely on Supabase Auth, the project uses a custom JWT implementation (`lib/auth.ts`) that sets HTTP-only cookies (`auth_token`).
*   **Signup Flow:** Users register with details including their name, email, phone, college, degree, and a mandatory payment proof upload.
*   **Approval Gate:** New users are created with a `pending` status. An administrator must approve their account before they can access the dashboard.
*   **Role-Based Access Control (RBAC):** Users are categorized as either regular students or admins. Access to the `/admin` routes is protected by Next.js Middleware (`middleware.ts`), ensuring only users with the `admin` role can access management features.

### 3.2 Student Dashboard (`/dashboard`)
The primary interface for approved students, providing access to:
*   **Student Overview:** Displays user profile information, approval status, and overall course progress percentage.
*   **Video Classes:** Lessons are categorized. Students can select a category and watch embedded YouTube videos using a custom Plyr interface. Progress (completion status) is tracked per lesson.
*   **Study Materials:** Students can download supplementary materials. The application securely fetches these files from a private Supabase storage bucket (`study-materials`) using short-lived signed URLs.
*   **Mock Tests:** Students can view upcoming and available timed multiple-choice question (MCQ) tests. They can take tests, submit answers, and review their scores and correct answers afterward.

### 3.3 Admin Panel (`/admin`)
A protected area for administrators to manage the platform:
*   **User Management:** Admins can view all registered users, review their payment proofs, and approve or reject accounts (`app/admin/users`).
*   **Content Management:** Admins can create and manage categories, add video lessons (providing YouTube URLs), and upload study materials.
*   **Mock Test Management:** A dedicated section (`/admin/mock-tests`) to create new tests, define duration, add MCQ questions with multiple options and correct answers, and review all student attempts and scores.

## 4. Database Schema (Supabase PostgreSQL)
The core database tables include:

*   `users`: Stores user profile data, hashed passwords, approval status (`pending`, `approved`, `rejected`), and payment proof references.
*   `categories`: Groups lessons, materials, and mock tests (e.g., Computer Science, Mathematics, Aptitude).
*   `lessons`: Stores video class metadata, including the YouTube playback ID and duration.
*   `lesson_progress`: A join table tracking which user has completed which lesson.
*   `materials`: Stores metadata for downloadable study files, including the storage file path.
*   `mock_tests`: Defines a test, its category, duration, and start time.
*   `mock_questions`: Stores individual MCQs linked to a `mock_test`, including options (A, B, C, D) and the index of the correct answer.
*   `mock_attempts`: Records a student's submission for a test, storing their chosen answers, calculated score, and total possible score.

### 4.1 Row Level Security (RLS) & Policies
Supabase RLS is enabled on all tables to ensure data privacy:
*   Students can only read their own user profile data and their own `lesson_progress` and `mock_attempts`.
*   Students have read-only access to `lessons`, `materials`, and `categories`.
*   All write operations (inserts, updates, deletes) are typically performed via Next.js Server Actions using a Supabase `service_role` key, bypassing RLS to ensure secure, server-side data mutation.

## 5. Storage Buckets
The application utilizes two private Supabase storage buckets:
*   `payment-proofs`: Used during the signup process to store receipts or screenshots of payments. Accessible only by admins.
*   `study-materials`: Used to store PDFs or other documents. Accessed by students via temporary signed URLs generated by the server.

## 6. Directory Structure Overview
*   `app/`: Contains the Next.js App Router pages and layouts.
    *   `admin/`: Admin panel routes and server actions.
    *   `dashboard/`: Student dashboard routes, components (NavBar, VideoClasses, etc.), and server actions.
    *   `login/` & `signup/`: Authentication pages and logic.
    *   `components/`: Reusable global components (Header, Spinner, ThemeToggle).
*   `lib/`: Core utilities.
    *   `auth.ts`: JWT creation, verification, and password hashing logic.
    *   `supabaseClient.ts`: Supabase client initialization (both anonymous and admin clients).
*   `docs/`: Contains database schema SQL scripts.
*   `public/`: Static assets (icons).
*   `types/`: TypeScript type definitions.
*   `middleware.ts`: Next.js middleware for route protection.

## 7. Environment Variables
The application relies on the following environment variables (defined in `.env.local`):
*   `NEXT_PUBLIC_SUPABASE_URL`: The URL of the Supabase project.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key for client-side Supabase operations.
*   `SUPABASE_SERVICE_ROLE_KEY`: The secret admin key for server-side Supabase operations (bypassing RLS).
*   `AUTH_SECRET`: The secret key used to sign JWTs.
*   `ADMIN_EMAILS`: A comma-separated list of email addresses that automatically receive administrative privileges.
