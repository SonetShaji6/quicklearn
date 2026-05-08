"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL = 15_000; // Check every 15 seconds

export function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const res = await fetch("/api/session-check", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;

        if (!data.valid && data.reason === "session_replaced") {
          // Another device logged in — redirect immediately
          window.location.href = "/login?kicked=1";
        }
      } catch {
        // Network error — skip this cycle
      }
    };

    // First check after a short delay (don't block initial render)
    const initialTimeout = setTimeout(check, 3000);
    const interval = setInterval(check, POLL_INTERVAL);

    return () => {
      active = false;
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [router]);

  return null; // Invisible component
}
