"use client";

import {
  ASAM_DIMENSIONS,
  recommendLoc,
  asamAcuityLight,
  type AsamScores,
} from "@/lib/data/asam";
import { Badge } from "@/components/ui/badge";

type Props = {
  scores: AsamScores;
  onChange: (next: AsamScores) => void;
};

export function AsamScorer({ scores, onChange }: Props) {
  const update = (k: keyof AsamScores, v: number) =>
    onChange({ ...scores, [k]: v });

  const rec = recommendLoc(scores);
  const acuity = asamAcuityLight(scores);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="overline">ASAM 6-dimension assessment</div>
        <Badge tone={acuity}>{acuity} acuity</Badge>
      </div>

      <div className="space-y-3">
        {ASAM_DIMENSIONS.map((dim) => {
          const v = scores[dim.id];
          return (
            <div
              key={dim.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2.5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-3)]">
                    Dimension {dim.num}
                  </div>
                  <div className="truncate text-sm text-white">{dim.short}</div>
                </div>
                <div
                  className="font-mono text-2xl tabular-nums"
                  style={{
                    color:
                      v >= 3
                        ? "var(--error-soft)"
                        : v >= 2
                          ? "var(--warning)"
                          : "var(--success)",
                  }}
                >
                  {v}
                </div>
              </div>
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update(dim.id, n)}
                    className={`flex-1 rounded-md border py-1 text-xs font-medium transition ${
                      v === n
                        ? n >= 3
                          ? "border-[var(--error)]/60 bg-[var(--error)]/[0.12] text-[var(--error-soft)]"
                          : n >= 2
                            ? "border-[var(--warning)]/60 bg-[var(--warning)]/[0.12] text-[var(--warning)]"
                            : "border-[var(--success)]/60 bg-[var(--success)]/[0.12] text-[var(--success)]"
                        : "border-white/[0.06] bg-white/[0.02] text-[var(--ink-3)] hover:border-white/[0.18]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 text-[11px] italic text-[var(--ink-3)]">
                {dim.anchors[v]}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[var(--violet)]/30 bg-[var(--violet)]/[0.07] px-4 py-3">
        <div className="overline">Suggested LOC</div>
        <div className="mt-1.5 flex items-baseline gap-3">
          <span
            className="hero-gradient-text font-display text-3xl"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            ASAM {rec.level}
          </span>
          <span className="text-sm text-white">{rec.label}</span>
        </div>
        <div className="mt-1 text-[11px] text-[var(--ink-3)]">{rec.setting}</div>
        <div className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-4)]">
          heuristic only · clinician finalizes
        </div>
      </div>
    </div>
  );
}
