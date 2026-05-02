"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const storedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      
      const shouldBeDark = storedTheme === "dark" || (!storedTheme && prefersDark);
      
      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    // Listen for storage changes (cross-tab) and custom events (same-page sync)
    const handleThemeChange = () => applyTheme();
    
    window.addEventListener("storage", handleThemeChange);
    window.addEventListener("theme-change", handleThemeChange);
    
    return () => {
      window.removeEventListener("storage", handleThemeChange);
      window.removeEventListener("theme-change", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    // Notify other components
    window.dispatchEvent(new Event("theme-change"));
  };

  if (!mounted) {
    return <div className="w-8 h-8" />; // Placeholder to avoid layout shift
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-8 h-8 rounded-[var(--radius)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--ql-red)] hover:bg-[var(--accent-light)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ql-red)] transition-all duration-200"
      aria-label="Toggle Dark Mode"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-[18px] h-[18px]">
        {/* Sun */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 transition-all duration-300 ${
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
          }`}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
        {/* Moon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 transition-all duration-300 ${
            isDark ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
          }`}
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </div>
    </button>
  );
}
