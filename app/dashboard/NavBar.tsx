"use client";

import { useEffect, useState } from "react";
import { logoutAction } from "./actions";

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
    <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-semibold text-white shadow-md shadow-indigo-200">
            QL
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">QuickLearn</p>
            <p className="text-[11px] text-slate-500">MCA LBS Crash Course</p>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-sm font-semibold text-slate-700">
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={clsx(
                "rounded-full px-3 py-2 transition",
                active === item.id ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "hover:bg-slate-100"
              )}
            >
              {item.label}
            </a>
          ))}
          <form action={logoutAction} className="ml-2">
            <button
              type="submit"
              className="rounded-full px-3 py-2 text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
