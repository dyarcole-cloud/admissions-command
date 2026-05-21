"use client";

import { useCrisis } from "./CrisisProvider";

export function CrisisFab() {
  const { open, openCrisis } = useCrisis();
  if (open) return null;
  return (
    <button
      type="button"
      onClick={() => openCrisis()}
      aria-label="Open crisis protocol (Ctrl/Cmd + Shift + C)"
      title="Crisis (Ctrl/Cmd + Shift + C)"
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full border border-[var(--error)]/50 bg-[var(--bg-deep)]/85 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--error-soft)] backdrop-blur-xl transition hover:bg-[var(--error)]/[0.10] md:bottom-6 print:hidden"
      style={{
        boxShadow:
          "0 0 24px rgba(239,68,68,0.32), 0 8px 28px -8px rgba(239,68,68,0.45)",
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--error)]/60" />
        <span className="relative inline-block size-2 rounded-full bg-[var(--error)]" />
      </span>
      Crisis
      <span className="hidden font-mono text-[10px] tracking-[0.08em] text-[var(--ink-3)] sm:inline">
        ⌘⇧C
      </span>
    </button>
  );
}
