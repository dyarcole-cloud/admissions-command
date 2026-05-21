"use client";

import { useEffect, useState } from "react";
import {
  CRISIS_PROTOCOLS,
  findProtocol,
  type CrisisId,
} from "@/lib/data/crisisProtocols";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  initialId?: CrisisId | null;
  onClose: () => void;
};

export function CrisisOverlay({ open, initialId, onClose }: Props) {
  const [activeId, setActiveId] = useState<CrisisId>(initialId ?? "si");

  useEffect(() => {
    if (initialId) setActiveId(initialId);
  }, [initialId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const active = findProtocol(activeId);
  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-stretch overflow-y-auto bg-[var(--bg-deep)]/95 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-[var(--error)]" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--error-soft)]">
                Crisis mode active
              </span>
            </div>
            <h2
              id="crisis-title"
              className="font-display mt-2 text-3xl text-white md:text-4xl"
              style={{ fontVariationSettings: "'opsz' 120" }}
            >
              {active.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--ink-2)]">
              {active.trigger}
            </p>
          </div>
          <Button variant="utility" onClick={onClose}>
            Exit (Esc)
          </Button>
        </div>

        {/* Protocol picker */}
        <div className="flex flex-wrap gap-2">
          {CRISIS_PROTOCOLS.map((p) => {
            const isActive = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(p.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.08em] transition ${
                  isActive
                    ? p.severity === "critical"
                      ? "border-[var(--error)]/60 bg-[var(--error)]/[0.14] text-[var(--error-soft)]"
                      : "border-[var(--warning)]/60 bg-[var(--warning)]/[0.14] text-[var(--warning)]"
                    : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    p.severity === "critical" ? "bg-[var(--error)]" : "bg-[var(--warning)]"
                  }`}
                />
                {p.short}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Steps */}
          <div className="card-aurora">
            <div className="overline mb-3">Protocol steps</div>
            <ol className="space-y-3">
              {active.steps.map((s, i) => (
                <li
                  key={s.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs tabular-nums text-[var(--periwinkle)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="text-sm text-white">{s.label}</div>
                  </div>
                  <p
                    className="font-display mt-2 ml-7 text-[15px] italic leading-relaxed text-[var(--ink-2)]"
                    style={{ fontVariationSettings: "'opsz' 72" }}
                  >
                    “{s.script}”
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Side rail */}
          <div className="space-y-4">
            <div className="card-aurora">
              <Badge tone={active.severity === "critical" ? "error" : "warning"}>
                {active.severity === "critical" ? "Critical" : "High severity"}
              </Badge>
              <div className="overline mt-3 mb-2">Immediate actions</div>
              <ul className="space-y-2 text-sm text-[var(--ink-2)]">
                {active.immediateActions.map((a) => (
                  <li
                    key={a}
                    className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2"
                  >
                    <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[var(--periwinkle)]" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-aurora">
              <div className="overline mb-2">Resources</div>
              <ul className="space-y-2">
                {active.resources.map((r) => (
                  <li
                    key={r.label}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2 text-xs"
                  >
                    <div className="text-white">{r.label}</div>
                    <div className="mt-0.5 text-[var(--ink-3)]">{r.detail}</div>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="destructive" className="w-full" onClick={onClose}>
              Close crisis overlay
            </Button>
          </div>
        </div>

        <p className="mt-2 text-[11px] text-[var(--ink-4)]">
          Crisis protocols are clinician-authored frameworks, not legal or
          medical advice. Always coordinate with Clinical / Medical Director on
          active SI, HI, and medical emergencies.
        </p>
      </div>
    </div>
  );
}
