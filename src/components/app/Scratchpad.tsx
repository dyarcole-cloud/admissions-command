"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "acmd:scratchpad:v1";

export function Scratchpad() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hydrate
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setText(stored);
    } catch {}
  }, []);

  // Hotkey: Ctrl/Cmd + /
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => textareaRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Debounced autosave
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, text);
        setSavedAt(Date.now());
      } catch {}
    }, 220);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open scratchpad (Ctrl/Cmd + /)"
        title="Scratchpad (Ctrl/Cmd + /)"
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 z-30 flex items-center gap-2 rounded-full border border-white/[0.12] bg-[var(--bg-deep)]/85 px-3.5 py-2 text-xs font-medium text-[var(--ink-2)] backdrop-blur-xl transition hover:border-[var(--periwinkle)]/40 hover:text-white md:bottom-6 print:hidden"
      >
        <span aria-hidden="true">✎</span>
        <span className="hidden sm:inline">Scratchpad</span>
        <span className="hidden font-mono text-[10px] tracking-[0.08em] text-[var(--ink-3)] md:inline">
          ⌘/
        </span>
      </button>

      {open && (
        <div
          className="fixed bottom-[calc(8rem+env(safe-area-inset-bottom))] left-4 z-40 w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-white/[0.12] bg-[var(--bg-deep)]/95 p-4 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl md:bottom-20 print:hidden"
          role="dialog"
          aria-label="Scratchpad"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <div className="overline">Scratchpad</div>
              <p className="text-[10px] text-[var(--ink-4)]">
                Local-only · autosaves · Esc to close
              </p>
            </div>
            <div className="flex items-center gap-2">
              {savedAt && (
                <span className="font-mono text-[10px] tabular-nums text-[var(--ink-4)]">
                  {new Date(savedAt).toLocaleTimeString()}
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Notes to yourself, names, callbacks, anything you'd write on a sticky…"
            rows={10}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-sm leading-relaxed text-[var(--ink-2)] outline-none focus:border-[var(--periwinkle)]/40 focus:ring-2 focus:ring-[var(--violet)]/20"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[10px] tabular-nums text-[var(--ink-4)]">
              {text.length} chars
            </span>
            <button
              type="button"
              onClick={() => {
                if (!confirm("Clear scratchpad?")) return;
                setText("");
                try {
                  localStorage.removeItem(STORAGE_KEY);
                } catch {}
              }}
              className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-[var(--error-soft)]"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
}
