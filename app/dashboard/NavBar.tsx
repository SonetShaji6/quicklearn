"use client";

import { useEffect, useState } from "react";
import { logoutAction } from "./actions";
import { ThemeToggle } from "../components/ThemeToggle";

const sections = [
  { id: "overview", label: "Dashboard" },
  { id: "videos", label: "Video Classes" },
  { id: "materials", label: "Study Materials" },
  { id: "mocktests", label: "Mock Test" },
];

function clsx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

export function DashboardNav() {
  const [active, setActive] = useState<string>("overview");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((e) => e.isIntersecting);
        if (entry?.target?.id) setActive(entry.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0.25 }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-indigo-100 supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/70 dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
            QL
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">QuickLearn</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">Student Dashboard</p>
          </div>
        </div>

        <button
          className="p-2 text-slate-600 sm:hidden hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          type="button"
        >
          <span className="sr-only">Menu</span>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>

        <div className="hidden items-center gap-1 text-sm font-medium text-slate-600 sm:flex dark:text-slate-300">
          <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-full border border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50">
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={clsx(
                  "rounded-full px-4 py-1.5 transition-all duration-300 ease-out",
                  active === item.id 
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-700 dark:text-indigo-400 dark:ring-slate-600" 
                      : "text-slate-500 hover:text-indigo-600 hover:bg-white/50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-700/50"
                )}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mx-3 h-5 w-px bg-slate-200 dark:bg-slate-700"></div>
          <ThemeToggle />
          <div className="mx-1"></div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 border border-transparent hover:border-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/20 dark:hover:border-rose-800"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className={clsx(
            "overflow-hidden transition-all duration-300 sm:hidden",
            menuOpen ? "max-h-[500px] opacity-100 border-t border-slate-100 shadow-lg dark:border-slate-800" : "max-h-0 opacity-0"
      )}>
        <div className="bg-white/80 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1 dark:bg-slate-900/80">
            <div className="flex justify-end pt-2 pb-1">
                 <ThemeToggle />
            </div>
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  "block rounded-lg px-4 py-3 transition text-sm font-medium",
                  active === item.id 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                )}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-100 mt-2 dark:border-slate-800">
                <form action={logoutAction} className="w-full">
                <button
                    type="submit"
                    className="w-full text-left rounded-lg px-4 py-3 transition text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                >
                    Logout
                </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
