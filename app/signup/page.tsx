import Link from "next/link";
import { SignupForm } from "./SignupForm";

const benefits = [
  "Fast 3-step registration tailored for MCA LBS learners.",
  "Secure login with protected progress and quiz history.",
  "Instant access to crash-course videos, PDFs, and quizzes.",
  "Dashboard that highlights weak areas and tracks streaks.",
];

export const metadata = {
  title: "QuickLearn | Sign Up",
  description: "Create your QuickLearn account for MCA LBS crash course videos, quizzes, and progress tracking.",
};

export default function SignupPage() {
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
      <main className="relative mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 sm:py-16">
        
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
              Create your MCA LBS account
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Register for QuickLearn and unlock the MCA LBS crash course toolkit.
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              Join in minutes to access concise video lessons, downloadable PDFs, timed quizzes with instant results, and a progress dashboard that keeps you on pace for exam day.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              {benefits.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-emerald-600">●</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
              Already have an account? <Link className="font-semibold text-indigo-700 hover:text-indigo-800" href="/login">Login here</Link> to jump back into your dashboard.
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <p className="text-sm font-semibold text-indigo-700">Payment information</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li>Course Fee: <span className="font-semibold text-slate-900">₹4,999</span></li>
                <li>Payment Method: <span className="font-semibold text-slate-900">UPI / Bank Transfer</span></li>
                <li>
                  Note: Please complete the payment for the MCA LBS Crash Course and upload the payment screenshot below for verification.
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <SignupForm />
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-xs text-slate-500 shadow-sm">
              We store your payment proof privately. Your account will be activated after an admin reviews and approves the payment.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
