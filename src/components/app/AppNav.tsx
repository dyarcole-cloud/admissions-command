"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  glyph: string;
  shortLabel?: string;
};

const ITEMS: NavItem[] = [
  { href: "/app", label: "Cockpit", glyph: "◉", shortLabel: "Cockpit" },
  { href: "/app/preadmit", label: "Pre-Admit", glyph: "◈", shortLabel: "Intake" },
  { href: "/app/payors", label: "Payor Engine", glyph: "◊", shortLabel: "Payors" },
  { href: "/app/analytics", label: "Analytics", glyph: "▤", shortLabel: "Stats" },
  { href: "/app/settings", label: "Settings", glyph: "⚙", shortLabel: "Settings" },
];

function isCurrent(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const active = isCurrent(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              active
                ? "bg-white/[0.06] text-white"
                : "text-[var(--ink-2)] hover:bg-white/[0.03] hover:text-white"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-7 items-center justify-center rounded-lg text-xs",
                active
                  ? "bg-[var(--violet)]/20 text-[var(--violet)]"
                  : "bg-white/[0.04] text-[var(--ink-3)] group-hover:text-[var(--periwinkle)]"
              )}
            >
              {item.glyph}
            </span>
            {item.label}
            {active && (
              <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-[var(--periwinkle)]">
                live
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppMobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-1 border-t border-white/[0.08] bg-[var(--bg-deep)]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl md:hidden"
      aria-label="Primary"
    >
      {ITEMS.map((item) => {
        const active = isCurrent(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition",
              active ? "text-[var(--periwinkle)]" : "text-[var(--ink-3)]"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "text-base leading-none",
                active && "drop-shadow-[0_0_8px_rgba(167,139,250,0.7)]"
              )}
            >
              {item.glyph}
            </span>
            <span className="text-[10px] uppercase tracking-[0.08em]">
              {item.shortLabel ?? item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
