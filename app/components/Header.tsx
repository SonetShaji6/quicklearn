"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 border-b ${
        isScrolled || isMobileMenuOpen
          ? "glass border-[var(--border)] shadow-[var(--shadow-sm)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ql-red)] to-[#c0392b] text-sm font-black text-white shadow-[var(--shadow-red)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]">
            M
            <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
              MCA<span className="text-[var(--ql-red)] ml-0.5">RIT</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] mt-0.5 hidden sm:block">
              LBS Crash Course
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 text-sm font-medium md:flex">
          {[
            { href: "/", label: "Home" },
            { href: "/#features", label: "Features" },
            { href: "/#about", label: "About" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--ql-red)] transition-colors rounded-lg hover:bg-[var(--accent-light)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--ql-red)] transition-colors rounded-lg hover:bg-[var(--accent-light)]"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="btn-primary text-sm !py-2.5 !px-5 group"
          >
            Get Started
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--ql-red)] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-[5px] w-[18px]">
              <span
                className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? "rotate-45 translate-y-[7px] bg-[var(--ql-red)]" : ""
                }`}
              />
              <span
                className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-[7px] bg-[var(--ql-red)]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          isMobileMenuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass border-t border-[var(--border)] px-5 pb-5 pt-3 space-y-2">
          <nav className="flex flex-col space-y-0.5">
            {[
              { href: "/", label: "Home" },
              { href: "/#features", label: "Features" },
              { href: "/#about", label: "About" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--ql-red)] rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-2 border-t border-[var(--border)]">
            <Link
              href="/login"
              className="btn-secondary w-full !py-3 text-center !rounded-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="btn-primary w-full !py-3 text-center !rounded-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
