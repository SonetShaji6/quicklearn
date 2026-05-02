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
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ql-red)] text-sm font-black text-white shadow-[var(--shadow-red)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]">
            Q
          </span>
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] hidden sm:block">
            Quick<span className="text-[var(--ql-red)]">Learn</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <Link href="/" className="hover-line px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--ql-red)] transition-colors">
            Home
          </Link>
          <Link href="/#features" className="hover-line px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--ql-red)] transition-colors">
            Features
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="btn-ghost text-sm"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="btn-primary text-sm !py-2 !px-5"
          >
            Get Started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="flex flex-col gap-1.5 p-2 text-[var(--text-secondary)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 origin-center ${
                isMobileMenuOpen ? "rotate-45 translate-y-2 bg-[var(--ql-red)]" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0 translate-x-3" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 origin-center ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-2 bg-[var(--ql-red)]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          isMobileMenuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass border-t border-[var(--border)] px-6 pb-6 pt-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              className="px-4 py-3 font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--ql-red)] rounded-[var(--radius-md)] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="px-4 py-3 font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--ql-red)] rounded-[var(--radius-md)] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
          </nav>

          <div className="pt-3 flex flex-col gap-2 border-t border-[var(--border)]">
            <Link
              href="/login"
              className="btn-secondary w-full !py-3 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="btn-primary w-full !py-3 text-center"
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
