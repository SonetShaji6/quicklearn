import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "QuickLearn | Login",
  description: "Login to QuickLearn MCA LBS crash course platform.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.08),transparent_32%),radial-gradient(circle_at_50%_70%,rgba(16,185,129,0.08),transparent_28%)]" />
<header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-semibold text-white shadow-md shadow-indigo-200">
              QL
            </span>
            <div className="leading-tight">
              <p className="text-lg font-semibold">QuickLearn</p>
              <p className="text-xs text-slate-500">Your Smart MCA LBS Crash Course Companion</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            <Link href="/#home" className="transition hover:text-indigo-600">Home</Link>
            <Link href="/#about" className="transition hover:text-indigo-600">About</Link>
            <Link href="/#course" className="transition hover:text-indigo-600">Course</Link>
            <Link href="/login" className="transition hover:text-indigo-600">Login</Link>
            <Link href="/signup" className="transition hover:text-indigo-600">Sign Up</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-100 hover:bg-indigo-50/60 hover:text-indigo-700 md:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="block border-t border-slate-200/70 bg-white/80 px-6 pb-3 pt-2 md:hidden">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
            <Link href="/#home" className="transition hover:text-indigo-600">Home</Link>
            <Link href="/#about" className="transition hover:text-indigo-600">About</Link>
            <Link href="/#course" className="transition hover:text-indigo-600">Course</Link>
            <Link href="/login" className="transition hover:text-indigo-600">Login</Link>
            <Link href="/signup" className="transition hover:text-indigo-600">Sign Up</Link>
          </nav>
        </div>
      </header>
      <main className="relative mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12 sm:py-16">
        

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <LoginForm />
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6 shadow-md shadow-indigo-50">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Login requirements</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2"><span className="text-emerald-600">●</span> Use the email you registered with.</li>
              <li className="flex gap-2"><span className="text-emerald-600">●</span> Passwords are securely hashed; we never store plain text.</li>
              <li className="flex gap-2"><span className="text-emerald-600">●</span> Accounts must be <strong>approved</strong> after payment verification.</li>
              <li className="flex gap-2"><span className="text-emerald-600">●</span> Pending accounts cannot access the dashboard.</li>
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              If you uploaded your payment proof recently, please allow the admin team to review and approve your account before logging in.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
