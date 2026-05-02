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
  description:
    "Create your QuickLearn account for MCA LBS crash course videos, quizzes, and progress tracking.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <Link
        href="/"
        className="fixed top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--ql-red)] transition-colors p-2 rounded-[var(--radius-md)] hover:bg-[var(--accent-light)] bg-[var(--surface)]/80 backdrop-blur-sm border border-[var(--border)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </Link>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex justify-center lg:justify-start mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <span className="h-10 w-10 rounded-xl bg-[var(--ql-red)] flex items-center justify-center text-white text-lg font-black shadow-[var(--shadow-red)] group-hover:scale-110 transition-transform">
              Q
            </span>
            <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Quick<span className="text-[var(--ql-red)]">Learn</span>
            </span>
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-start">
          {/* Left Column: Context */}
          <div className="space-y-8 animate-fade-in-up order-2 lg:order-1">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] mb-4 leading-tight">
                Join the crash course &<br />
                <span className="text-[var(--ql-red)]">master the syllabus</span>
              </h1>
              <p className="text-lg text-[var(--text-tertiary)] leading-relaxed">
                Get access to concise video lessons, downloadable PDFs, and timed
                quizzes designed to help you ace the MCA LBS exam.
              </p>
            </div>

            <ul className="space-y-3">
              {benefits.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[var(--text-secondary)]"
                >
                  <div className="mt-0.5 w-5 h-5 rounded-md bg-[var(--success-light)] text-[var(--success)] flex items-center justify-center shrink-0">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="ql-card-static p-5 space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-light)] text-[var(--ql-red)]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                Payment Information
              </h3>
              <div className="space-y-0 text-sm divide-y divide-[var(--border)]">
                <div className="flex justify-between items-center py-3">
                  <span className="text-[var(--text-muted)]">Course Fee</span>
                  <span className="font-black text-[var(--text-primary)] text-lg">₹4,999</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[var(--text-muted)]">Method</span>
                  <span className="font-medium text-[var(--text-secondary)]">UPI / Bank Transfer</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
                Upload payment proof during signup. Admin verification takes 1-24 hours.
              </p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="animate-fade-in-up delay-100 order-1 lg:order-2 space-y-6">
            <SignupForm />
            <div className="text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--ql-red)] hover:underline underline-offset-4"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
