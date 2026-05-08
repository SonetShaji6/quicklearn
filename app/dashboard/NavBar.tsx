"use client";

import { useEffect, useState } from "react";
import { logoutAction } from "./actions";
import { ThemeToggle } from "../components/ThemeToggle";
import { NotificationBell, type NotificationItem } from "./NotificationBell";

const sections = [
  { id: "overview", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "videos", label: "Videos", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "materials", label: "Materials", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "mocktests", label: "Mock Tests", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
];

function clsx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

interface DashboardNavProps {
  userId: string;
  initialNotifications: NotificationItem[];
}

export function DashboardNav({ userId, initialNotifications }: DashboardNavProps) {
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
    <div className="sticky top-0 z-30 glass border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--ql-red)] text-white font-black shadow-sm">
            M
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-[var(--text-primary)]">MCA RIT</p>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--ql-red)]">Dashboard</p>
          </div>
        </div>

        {/* Mobile: bell + hamburger always visible */}
        <div className="flex items-center gap-1 sm:hidden">
          <NotificationBell userId={userId} initialNotifications={initialNotifications} />
          <button
            className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] rounded-[var(--radius)] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 text-sm font-medium sm:flex">
          <div className="flex items-center gap-0.5 bg-[var(--surface-secondary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={clsx(
                  "rounded-[var(--radius)] px-3 py-1.5 transition-all duration-200 ease-out flex items-center gap-1.5 text-xs font-semibold",
                  active === item.id
                    ? "bg-[var(--surface)] text-[var(--ql-red)] shadow-[var(--shadow-sm)] border border-[var(--border)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-transparent"
                )}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </a>
            ))}
          </div>
          <div className="mx-2 h-5 w-px bg-[var(--border)]"></div>
          <NotificationBell userId={userId} initialNotifications={initialNotifications} />
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              className="ml-1 rounded-[var(--radius)] px-3 py-1.5 text-xs font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-light)] border border-transparent hover:border-[var(--danger)]/20"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={clsx(
        "overflow-hidden transition-all duration-300 sm:hidden",
        menuOpen ? "max-h-[500px] opacity-100 border-t border-[var(--border)]" : "max-h-0 opacity-0"
      )}>
        <div className="glass px-4 pb-4 pt-2 space-y-1">
          <div className="flex items-center justify-end gap-2 pt-1 pb-2">
            <ThemeToggle />
          </div>
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                "flex items-center gap-2.5 rounded-[var(--radius-md)] px-4 py-3 transition text-sm font-medium",
                active === item.id
                  ? "bg-[var(--accent-light)] text-[var(--ql-red)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </a>
          ))}
          <div className="pt-2 border-t border-[var(--border)] mt-2">
            <form action={logoutAction} className="w-full">
              <button
                type="submit"
                className="w-full text-left rounded-[var(--radius-md)] px-4 py-3 transition text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger-light)]"
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
