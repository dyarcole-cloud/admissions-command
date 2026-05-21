"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ROUTES: Record<string, string> = {
  c: "/app",
  i: "/app/preadmit",
  p: "/app/payors",
  a: "/app/analytics",
  s: "/app/settings",
};

/** Listens for "g <key>" chord (vim-style) to jump between /app surfaces.
 *  Ignores inputs/textareas. Resets after 1.4s if no follow-up. */
export function GoToNav() {
  const router = useRouter();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (inField) return;

      if (!armed && (e.key === "g" || e.key === "G")) {
        setArmed(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => setArmed(false), 1400);
        return;
      }

      if (armed) {
        const k = e.key.toLowerCase();
        if (ROUTES[k]) {
          e.preventDefault();
          router.push(ROUTES[k]);
        }
        setArmed(false);
        if (timer) clearTimeout(timer);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer) clearTimeout(timer);
    };
  }, [armed, router]);

  if (!armed) return null;
  return (
    <div className="font-mono fixed top-4 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-[var(--periwinkle)]/30 bg-[var(--bg-deep)]/95 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--periwinkle)] backdrop-blur-xl">
      g_ <span className="text-[var(--ink-3)]">· c i p a s</span>
    </div>
  );
}
