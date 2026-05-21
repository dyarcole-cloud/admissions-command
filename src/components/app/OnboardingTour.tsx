"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "acmd:onboarding:dismissed:v1";

type Step = {
  title: string;
  body: string;
  hint: string;
};

const STEPS: Step[] = [
  {
    title: "Insurance Intel",
    body: "Type any plan name in the left column — 864 plans light up in real time. Light tier, admit rule, claims playbook all populate instantly.",
    hint: "Try \"Cigna\" or \"Anthem\"",
  },
  {
    title: "Segments + ASAM",
    body: "Five-phase script in the middle. On the Clinical segment, the checklist swaps for ASAM-6 — score each dimension, the LOC recommendation updates live.",
    hint: "Segments 1 → 5, ⌘/Ctrl+Enter sends advisor messages",
  },
  {
    title: "Advisor + Crisis",
    body: "Right column is the AI Advisor. Below it: objection library + MI prompt library filtered to your current segment. Crisis FAB bottom-right is always one click away.",
    hint: "⌘/Ctrl+Shift+C opens crisis from anywhere",
  },
  {
    title: "When you're done",
    body: "End the call with Placed / Referred / Lost — it logs into Analytics. Pre-Admit's 10-section assessment is its own surface with brief screeners and DEID-on-submit.",
    hint: "Bring your own Anthropic key in Settings for real Claude coaching",
  },
];

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
  };

  if (!open) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onb-title"
    >
      <div
        className="absolute inset-0 bg-[var(--bg-deep)]/85 backdrop-blur-xl"
        onClick={close}
        aria-hidden="true"
      />
      <div className="card-aurora relative z-10 w-full max-w-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="overline">Welcome · {step + 1} / {STEPS.length}</span>
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-white"
          >
            Skip
          </button>
        </div>
        <h2
          id="onb-title"
          className="font-display text-2xl text-white"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          {s.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">
          {s.body}
        </p>
        <p className="font-mono mt-3 text-[11px] uppercase tracking-[0.12em] text-[var(--periwinkle)]">
          {s.hint}
        </p>

        <div className="mt-5 flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-[var(--violet)]"
                    : i < step
                      ? "w-1.5 bg-[var(--periwinkle)]/60"
                      : "w-1.5 bg-white/[0.10]"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="utility"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                if (isLast) close();
                else setStep((s) => Math.min(STEPS.length - 1, s + 1));
              }}
            >
              {isLast ? "Got it →" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
