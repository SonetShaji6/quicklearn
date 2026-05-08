import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "MCA RIT | Login",
  description: "Login to MCA RIT MCA LBS crash course platform.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex overflow-hidden relative">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0a0a0a] relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--ql-red)] opacity-[0.08] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[var(--ql-red)] opacity-[0.05] rounded-full blur-[80px]"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-md space-y-8">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ql-red)] text-lg font-black text-white shadow-[var(--shadow-red-lg)] transition-transform group-hover:scale-110">
              M
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              MCA <span className="text-[var(--ql-red)]">RIT</span>
            </span>
          </Link>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              Master the MCA LBS<br />
              exam with <span className="text-[var(--ql-red)]">precision</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed">
              Access your personalized dashboard, pick up where you left off, and track your journey to cracking the exam.
            </p>
          </div>

          {/* Floating testimonial card */}
          <div className="rounded-[var(--radius-xl)] border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-[var(--ql-red)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/60 text-sm leading-relaxed italic">
              &ldquo;MCA RIT made the entire preparation structured. The mock tests alone boosted my confidence significantly.&rdquo;
            </p>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">— Student, MCA LBS 2025</p>
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-[var(--background)] relative">
        <Link
          href="/"
          className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--ql-red)] transition-colors p-2 rounded-[var(--radius-md)] hover:bg-[var(--accent-light)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </Link>

        {/* Logo for mobile */}
        <div className="flex justify-center mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="h-10 w-10 rounded-xl bg-[var(--ql-red)] flex items-center justify-center text-white text-lg font-black shadow-[var(--shadow-red)] group-hover:scale-110 transition-transform">
                M
              </span>
              <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                MCA <span className="text-[var(--ql-red)]">RIT</span>
              </span>
          </Link>
        </div>

        <div className="w-full max-w-md animate-fade-in-up">
          <Suspense fallback={<div className="h-96 w-full skeleton" />}>
            <LoginForm />
          </Suspense>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[var(--ql-red)] hover:underline underline-offset-4 transition-all">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
