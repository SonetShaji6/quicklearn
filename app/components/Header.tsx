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
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        isScrolled || isMobileMenuOpen
          ? "bg-white/70 backdrop-blur-xl border-indigo-100 shadow-sm supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/70 dark:border-slate-800"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-50 dark:ring-indigo-900">
            QL
          </span>
          <div className="leading-tight hidden sm:block">
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              QuickLearn
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <Link href="/#features" className="hover:text-indigo-600 transition-colors">
            Features
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex flex-col gap-1.5 md:hidden p-2 text-slate-600 dark:text-slate-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2 bg-indigo-600" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0 translate-x-3" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2 bg-indigo-600" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out md:hidden shadow-xl ${
          isMobileMenuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/90 backdrop-blur-xl border-b border-indigo-50 px-6 pb-8 pt-4 space-y-4 dark:bg-slate-900/90 dark:border-slate-800">
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              className="px-4 py-2 font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="px-4 py-2 font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
               onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
          </nav>

          <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full text-center rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="w-full text-center rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
        </div>
      </div>
    </header>
  );
}
