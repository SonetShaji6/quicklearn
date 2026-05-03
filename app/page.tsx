import Link from "next/link";
import { Header } from "@/app/components/Header";

const features = [
  {
    title: "Military-grade security",
    description: "Protected access with JWT tokens and HTTP-only cookies, so your progress and quiz history stay completely private.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Crash course video library",
    description: "Concise, exam-focused video lessons covering the latest MCA LBS blueprint — watch at your pace.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Downloadable resources",
    description: "Structured PDFs, formula sheets, and revision checklists — all securely hosted, ready to save offline.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    title: "Timed mock engine",
    description: "Realistic exam simulations with instant scoring, answer review, and detailed breakdowns.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Progress intelligence",
    description: "Visual dashboards that surface completion rates, weak areas, and learning streaks to keep you on pace.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Admin control center",
    description: "Full content management for admins — approve users, upload materials, create tests, all from one dashboard.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const stats = [
  { value: "500+", label: "Students enrolled" },
  { value: "120+", label: "Video lessons" },
  { value: "98%", label: "Pass rate" },
  { value: "24h", label: "Support response" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--ql-red)] opacity-[0.03] blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[var(--ql-red)] opacity-[0.02] blur-[100px]"></div>
      </div>

      <Header />

      <main className="relative z-10" id="home">
        {/* ─── HERO ─────────────────────────────────────────────── */}
        <section className="relative pt-24 pb-16 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div className="animate-fade-in-up space-y-8 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-xs)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ql-red)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ql-red)]"></span>
                </span>
                Registration Open — MCA LBS 2026
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-[var(--text-primary)]">
                Crack MCA LBS with{" "}
                <span className="relative inline-block">
                  <span className="text-[var(--ql-red)]">confidence</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                    <path d="M1 5.5C47.5 2.5 100 1 199 5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[var(--ql-red)] opacity-30" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-[var(--text-tertiary)] leading-relaxed max-w-md">
                Structured video lessons, timed mock tests, and downloadable study materials — everything designed to simplify your preparation.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/signup" className="btn-primary text-base !py-3.5 !px-8" id="hero-signup-btn">
                  Start Learning
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/login" className="btn-secondary text-base !py-3.5 !px-8" id="hero-login-btn">
                  Student Login
                </Link>
              </div>
            </div>

            {/* Right — Abstract Visual */}
            <div className="animate-fade-in-up delay-200 relative hidden lg:block">
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-4 bg-[var(--ql-red)] opacity-[0.04] rounded-[2rem] blur-2xl"></div>
                
                {/* Main Card */}
                <div className="ql-card-static overflow-hidden relative">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--ql-red)] opacity-80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)] opacity-80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] opacity-80"></div>
                    </div>
                    <div className="mx-auto text-[11px] font-medium text-[var(--text-muted)] tracking-wide">QuickLearn Dashboard</div>
                  </div>
                  
                  {/* Dashboard preview content */}
                  <div className="p-6 space-y-5 bg-[var(--surface)]">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[var(--text-secondary)]">Course Progress</span>
                        <span className="text-[var(--ql-red)]">72%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: "72%" }}></div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Completed", value: "24", color: "var(--success)" },
                        { label: "Remaining", value: "9", color: "var(--warning)" },
                        { label: "Accuracy", value: "87%", color: "var(--ql-red)" },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-center bg-[var(--surface-secondary)]">
                          <p className="text-xl font-black text-[var(--text-primary)]" style={{ color: stat.color }}>{stat.value}</p>
                          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Lesson list preview */}
                    <div className="space-y-2">
                      {["Data Structures — Arrays", "Algorithms — Sorting", "DBMS — Normalization"].map((lesson, i) => (
                        <div key={lesson} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3 bg-[var(--surface)]">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${i < 2 ? "bg-[var(--success-light)] text-[var(--success)]" : "bg-[var(--surface-secondary)] text-[var(--text-muted)]"}`}>
                            {i < 2 ? "✓" : (i + 1)}
                          </div>
                          <span className="text-sm font-medium text-[var(--text-secondary)] flex-1">{lesson}</span>
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">{i < 2 ? "Done" : "15 min"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS BAR ───────────────────────────────────────── */}
        <section className="relative py-12 border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center animate-fade-in stagger-child" style={{ animationDelay: `${i * 100}ms` }}>
                  <p className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">{stat.value}</p>
                  <p className="text-sm font-medium text-[var(--text-muted)] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES ────────────────────────────────────────── */}
        <section id="features" className="py-20 lg:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <p className="section-label justify-center">Platform Features</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                Everything you need,<br className="hidden sm:block" />
                nothing you don&apos;t
              </h2>
              <p className="text-[var(--text-tertiary)] text-lg leading-relaxed">
                We stripped away the clutter so you can focus on what actually helps you learn faster and retain more.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="group ql-card p-6 space-y-4 animate-fade-in stagger-child"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-light)] text-[var(--ql-red)] flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--ql-red)] group-hover:text-white group-hover:shadow-[var(--shadow-red)] group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--ql-red)] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="mx-auto max-w-5xl relative overflow-hidden rounded-[var(--radius-2xl)]">
            {/* Background */}
            <div className="absolute inset-0 bg-slate-950 dark:bg-[#0a0a0a] dark:border dark:border-[var(--border)] rounded-[var(--radius-2xl)]"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--ql-red)] opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[var(--ql-red)] opacity-5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3"></div>
            
            {/* Content */}
            <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 text-center space-y-8">
              <div className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ql-red)]"></span>
                Limited seats available
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Ready to start your preparation?
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">
                Join the community of students mastering the MCA LBS syllabus with QuickLearn.
              </p>
              <Link
                href="/signup"
                className="btn-primary !bg-white !text-slate-950 hover:!bg-white/90 !shadow-xl text-base !py-3.5 !px-10 inline-flex"
                id="cta-signup-btn"
              >
                Create Free Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-12 bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <span className="h-8 w-8 rounded-lg bg-[var(--ql-red)] flex items-center justify-center text-white text-sm font-black shadow-[var(--shadow-red)]">
                Q
              </span>
              <span className="font-bold text-[var(--text-primary)] text-lg">
                Quick<span className="text-[var(--ql-red)]">Learn</span>
              </span>
            </div>
            <div className="flex gap-6 text-sm font-medium text-[var(--text-tertiary)]">
              <Link href="/" className="hover:text-[var(--ql-red)] transition-colors">Home</Link>
              <Link href="/login" className="hover:text-[var(--ql-red)] transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-[var(--ql-red)] transition-colors">Sign Up</Link>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              © {new Date().getFullYear()} QuickLearn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
