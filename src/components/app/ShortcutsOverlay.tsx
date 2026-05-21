"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Shortcut = {
  keys: string;
  label: string;
  group: "Global" | "Cockpit" | "Crisis" | "Notes";
};

const SHORTCUTS: Shortcut[] = [
  { keys: "?", label: "Open this shortcut panel", group: "Global" },
  { keys: "⌘/Ctrl + Shift + C", label: "Open crisis protocol overlay", group: "Crisis" },
  { keys: "⌘/Ctrl + /", label: "Toggle scratchpad", group: "Notes" },
  { keys: "Esc", label: "Close overlays / dialogs", group: "Global" },
  { keys: "G then C", label: "Go to Cockpit", group: "Global" },
  { keys: "G then I", label: "Go to Pre-Admit (Intake)", group: "Global" },
  { keys: "G then P", label: "Go to Payors", group: "Global" },
  { keys: "G then A", label: "Go to Analytics", group: "Global" },
  { keys: "G then S", label: "Go to Settings", group: "Global" },
  { keys: "J / K", label: "Previous / next segment", group: "Cockpit" },
  { keys: "Space", label: "Start / pause call timer", group: "Cockpit" },
  { keys: "⌘/Ctrl + Enter", label: "Send advisor message", group: "Cockpit" },
];

const GROUPS: Array<Shortcut["group"]> = [
  "Global",
  "Cockpit",
  "Crisis",
  "Notes",
];

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.key === "?" && !inField) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Keyboard shortcuts (?)"
        title="Keyboard shortcuts (?)"
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-[8.5rem] z-30 hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-[var(--bg-deep)]/85 text-sm font-mono text-[var(--ink-2)] backdrop-blur-xl transition hover:border-[var(--periwinkle)]/40 hover:text-white md:flex md:bottom-6 print:hidden"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center px-4 py-8 print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kbd-title"
        >
          <div
            className="absolute inset-0 bg-[var(--bg-deep)]/90 backdrop-blur-xl"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="card-aurora relative z-10 w-full max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="overline">Keyboard shortcuts</div>
                <h2
                  id="kbd-title"
                  className="font-display mt-1 text-2xl text-white"
                  style={{ fontVariationSettings: "'opsz' 96" }}
                >
                  Move faster.
                </h2>
              </div>
              <Button variant="utility" size="sm" onClick={() => setOpen(false)}>
                Close (Esc)
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {GROUPS.map((group) => {
                const items = SHORTCUTS.filter((s) => s.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group}>
                    <div className="overline mb-2">{group}</div>
                    <ul className="space-y-1.5">
                      {items.map((s) => (
                        <li
                          key={s.keys}
                          className="flex items-baseline justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2"
                        >
                          <span className="text-xs text-[var(--ink-2)]">
                            {s.label}
                          </span>
                          <kbd className="font-mono text-[10px] tabular-nums text-[var(--periwinkle)]">
                            {s.keys}
                          </kbd>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-4)]">
              Most shortcuts ignore inputs/textareas — type normally there.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
