import Link from "next/link";
import { SignupForm } from "./SignupForm";

const benefits = [
  "Fast 3-step registration tailored for MCA LBS learners.",
  "Secure login with protected progress and quiz history.",
  "Instant access to crash-course videos, PDFs, and quizzes.",
  "Dashboard that highlights weak areas and tracks streaks.",
];

export const metadata = {
  title: "MCA RIT | Sign Up",
  description:
    "Create your MCA RIT account for MCA LBS crash course videos, quizzes, and progress tracking.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <Link
        href="/"
        className="fixed top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--ql-red)] transition-colors p-2 rounded-[var(--radius-md)] hover:bg-[var(--accent-light)] bg-[var(--surface)]/80 backdrop-blur-sm border border-[var(--border)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        Back
      </Link>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex justify-center lg:justify-start mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <span className="h-10 w-10 rounded-xl bg-[var(--ql-red)] flex items-center justify-center text-white text-lg font-black shadow-[var(--shadow-red)] group-hover:scale-110 transition-transform">
              M
            </span>
            <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              MCA <span className="text-[var(--ql-red)]">RIT</span>
            </span>
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-start">
          {/* Left Column: Context */}
          <div className="space-y-8 animate-fade-in-up order-1 lg:order-1">
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

            <div className="ql-card-static p-6 space-y-5">
              <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-light)] text-[var(--ql-red)] shadow-sm">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                Payment Information
              </h3>

              <div className="bg-[var(--surface-secondary)] rounded-[var(--radius-lg)] p-5 border border-[var(--border)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-24 h-24 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 5V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5ZM19 13V21C19 21.5523 19.4477 22 20 22C20.5523 22 21 21.5523 21 21V13C21 12.4477 20.5523 12 20 12C19.4477 12 19 12.4477 19 13ZM3 17V21C3 21.5523 3.44772 22 4 22C4.55228 22 5 21.5523 5 21V17C5 16.4477 4.55228 16 4 16C3.44772 16 3 16.4477 3 17Z" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="shrink-0 bg-white p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <img
                      src="/GPAYQR.jpeg"
                      alt="UPI QR Code"
                      className="w-[120px] h-[120px] object-contain"
                      style={{ filter: "none" }}
                    />
                  </div>

                  <div className="space-y-3 w-full text-center sm:text-left">
                    <div>
                      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Scan to Pay via UPI</p>
                      <p className="text-base font-black text-[var(--text-primary)] font-mono bg-[var(--surface)] px-3 py-1.5 rounded-md border border-[var(--border)] inline-block">adilpalachira3@oksbi</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Amount</p>
                        <p className="text-lg font-black text-[var(--ql-red)]">₹200</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Name</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] mt-1">Adil Palachira</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pl-1">Or Bank Transfer</p>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 text-sm space-y-2 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-[var(--text-muted)]">Account Number</span>
                    <span className="font-mono font-bold text-[var(--text-primary)] tracking-wide">67286097598</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-[var(--text-muted)]">IFSC Code</span>
                    <span className="font-mono font-bold text-[var(--text-primary)] tracking-wide">SBIN0070048</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-[var(--text-muted)]">Bank Name</span>
                    <span className="font-medium text-[var(--text-secondary)]">State Bank of India</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--accent-light)] border border-[var(--border)] mt-2">
                <svg className="w-5 h-5 text-[var(--ql-red)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  After completing the payment, take a clear screenshot of the successful transaction and upload it in the form. Admin verification takes 1-24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="animate-fade-in-up delay-100 order-2 lg:order-2 space-y-6">
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
