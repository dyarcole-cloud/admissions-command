"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MI_PROMPTS,
  TECHNIQUE_LABELS,
  type MiTechnique,
} from "@/lib/data/miPrompts";

type Props = {
  segmentId: number;
};

const TECHNIQUE_TONE: Record<MiTechnique, "violet" | "copper" | "periwinkle"> = {
  open: "violet",
  affirm: "violet",
  reflect: "periwinkle",
  summary: "periwinkle",
  changeTalk: "copper",
  trauma: "copper",
};

const TONE_TO_BADGE: Record<string, "violet" | "copper"> = {
  violet: "violet",
  periwinkle: "violet",
  copper: "copper",
};

export function MiPrompts({ segmentId }: Props) {
  const [filter, setFilter] = useState<MiTechnique | "all">("all");

  const filtered = useMemo(() => {
    const matchingSegment = MI_PROMPTS.filter((p) =>
      p.segments.includes(segmentId)
    );
    if (filter === "all") return matchingSegment;
    return matchingSegment.filter((p) => p.technique === filter);
  }, [filter, segmentId]);

  const techniquesInSegment = useMemo(() => {
    const set = new Set<MiTechnique>();
    MI_PROMPTS.forEach((p) => {
      if (p.segments.includes(segmentId)) set.add(p.technique);
    });
    return Array.from(set);
  }, [segmentId]);

  return (
    <Card>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <div className="overline">MI prompts</div>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-4)]">
            segment-aware · trauma-informed
          </p>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-[var(--ink-4)]">
          {filtered.length} prompts
        </span>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.06em] transition ${
            filter === "all"
              ? "border-[var(--violet)]/60 bg-[var(--violet)]/[0.12] text-white"
              : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
          }`}
        >
          All
        </button>
        {techniquesInSegment.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.06em] transition ${
              filter === t
                ? "border-[var(--periwinkle)]/60 bg-[var(--violet)]/[0.10] text-white"
                : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
            }`}
          >
            {TECHNIQUE_LABELS[t]}
          </button>
        ))}
      </div>

      <ul className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <li className="rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] px-3 py-3 text-center text-[11px] text-[var(--ink-3)]">
            No prompts for this filter in this segment.
          </li>
        ) : (
          filtered.map((p, i) => (
            <li
              key={`${p.trigger}-${i}`}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                  {p.trigger}
                </span>
                <Badge
                  tone={TONE_TO_BADGE[TECHNIQUE_TONE[p.technique]] ?? "violet"}
                  className="shrink-0"
                >
                  {TECHNIQUE_LABELS[p.technique]}
                </Badge>
              </div>
              <p
                className="font-display mt-1.5 text-[13px] italic leading-snug text-[var(--ink-2)]"
                style={{ fontVariationSettings: "'opsz' 72" }}
              >
                “{p.script}”
              </p>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
