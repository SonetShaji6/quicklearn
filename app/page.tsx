const features = [
  {
    title: "Secure login system",
    description: "Protected access so your study progress and quiz results stay private.",
  },
  {
    title: "MCA LBS crash course videos",
    description: "Concise, exam-focused video lessons that cover the latest MCA LBS blueprint.",
  },
  {
    title: "Downloadable materials",
    description: "Structured PDFs, formula sheets, and revision checklists ready to save offline.",
  },
  {
    title: "Quiz engine with instant results",
    description: "Timed quizzes with immediate feedback so you know exactly what to fix next.",
  },
  {
    title: "Progress tracking dashboard",
    description: "Visual dashboards that show completion, weak areas, and streaks to keep you on pace.",
  },
];

export default function Home() {
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
            <a href="#home" className="transition hover:text-indigo-600">Home</a>
            <a href="#about" className="transition hover:text-indigo-600">About</a>
            <a href="#course" className="transition hover:text-indigo-600">Course</a>
             <a href="/login" className="transition hover:text-indigo-600">Login</a>
            <a href="/signup" className="transition hover:text-indigo-600">Sign Up</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
               href="/login"
              className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-100 hover:bg-indigo-50/60 hover:text-indigo-700 md:inline-flex"
            >
              Login
            </a>
            <a
              href="/signup"
              className="inline-flex rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
            >
              Sign Up
            </a>
          </div>
        </div>

        <div className="block border-t border-slate-200/70 bg-white/80 px-6 pb-3 pt-2 md:hidden">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
            <a href="#home" className="transition hover:text-indigo-600">Home</a>
            <a href="#about" className="transition hover:text-indigo-600">About</a>
            <a href="#course" className="transition hover:text-indigo-600">Course</a>
           <a href="/login" className="transition hover:text-indigo-600">Login</a>
            <a href="/signup" className="transition hover:text-indigo-600">Sign Up</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-6 pb-20 pt-14" id="home">
        <section className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
              MCA LBS 2026 • Crash Course
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Finish your MCA LBS prep faster with a focused crash course built for results.
              </h1>
              <p className="text-lg leading-relaxed text-slate-600">
                QuickLearn delivers bite-sized video lessons, downloadable study packs, timed quizzes, and a live dashboard so you can study smarter, track progress, and hit exam day with confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                 href="/login"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Login
              </a>
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                Sign Up
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:max-w-xl">
              <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-sm text-slate-500">Video-first path</p>
                <p className="text-lg font-semibold text-slate-900">15+ crash modules</p>
                <p className="text-sm text-slate-500">Curated by MCA mentors</p>
              </div>
              <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-sm text-slate-500">Quizzes & dashboards</p>
                <p className="text-lg font-semibold text-slate-900">Instant feedback</p>
                <p className="text-sm text-slate-500">See gaps in minutes</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-100 via-sky-50 to-emerald-50 blur-xl" aria-hidden />
            <div className="relative rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100/70">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-indigo-700">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">★</span>
                QuickLearn at a glance
              </div>
              <ul className="mt-6 space-y-4 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 text-indigo-600">●</span>
                  Structured MCA LBS crash course playlist with focused runtimes.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 text-indigo-600">●</span>
                  Downloadable PDFs and checklists for every topic you watch.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 text-indigo-600">●</span>
                  Quiz engine that gives instant scoring and curated fixes.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 text-indigo-600">●</span>
                  Progress tracking dashboard with streaks and completion bars.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="about" className="grid gap-10 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-indigo-50 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Platform description</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">How QuickLearn keeps MCA students exam-ready</h2>
            <p className="text-base leading-relaxed text-slate-600">
              QuickLearn is a dedicated MCA LBS crash course platform. We remove distractions with structured video lessons, crisp PDFs you can download, purposeful quizzes, and a dashboard that surfaces exactly what to revise next. Log in securely, follow the guided path, and see measurable improvement every study session.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">
              <p className="text-sm font-semibold text-indigo-700">Structured video lessons</p>
              <p className="mt-2 text-sm text-slate-600">Short, exam-focused clips with checkpoints so you never lose the thread.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">
              <p className="text-sm font-semibold text-indigo-700">Downloadable PDFs</p>
              <p className="mt-2 text-sm text-slate-600">Topic summaries, worked examples, and formula cards ready to save offline.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">
              <p className="text-sm font-semibold text-indigo-700">Quizzes with instant results</p>
              <p className="mt-2 text-sm text-slate-600">Immediate scoring plus remediation tips to close gaps faster.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">
              <p className="text-sm font-semibold text-indigo-700">Dashboard tracking</p>
              <p className="mt-2 text-sm text-slate-600">Streaks, completion %, and weak-area highlights to guide what to study next.</p>
            </div>
          </div>
        </section>

        <section id="course" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Features</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Everything you need for MCA LBS success</h2>
              <p className="text-base text-slate-600">Purpose-built tools so you can watch, practice, and track without leaving QuickLearn.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-50"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" aria-hidden />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <span className="text-lg font-semibold">★</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* <section id="login" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Login</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Access your QuickLearn dashboard</h2>
              <p className="text-base text-slate-600">Secure login to keep your MCA LBS progress, quizzes, and streaks in one place.</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <form
              className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-indigo-50"
              action="#"
              method="post"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Login</h3>
                  <p className="text-sm text-slate-500">Access your MCA LBS dashboard.</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Secure</span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800" htmlFor="login-email">
                    Email
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="you@example.com"
                  />
                  <p className="text-xs text-rose-500">Required for login.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-rose-500">Enter your password to continue.</p>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Login
              </button>

              <p className="mt-4 text-center text-sm text-slate-600">
                New to QuickLearn? <a href="/signup" className="font-semibold text-indigo-700 hover:text-indigo-800">Create an account</a>
              </p>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6 shadow-md shadow-indigo-50">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Need an account?</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Sign up to unlock the crash course</h3>
              <p className="mt-2 text-sm text-slate-600">
                Registration is quick. Get instant access to videos, PDFs, quizzes, and your personalized progress dashboard.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="text-emerald-600">●</span>
                  Instant course access after signup
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">●</span>
                  Save materials offline and track streaks
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">●</span>
                  Quizzes with instant feedback
                </li>
              </ul>
              <a
                href="/signup"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Go to Sign Up
              </a>
            </div>
          </div>
        </section> */}
      </main>

      <footer className="border-t border-slate-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-800">QuickLearn</p>
            <p>Focused MCA LBS crash course with videos, quizzes, and progress tracking.</p>
          </div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} QuickLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
