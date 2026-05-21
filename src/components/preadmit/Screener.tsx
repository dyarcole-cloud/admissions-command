"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  bandFor,
  flagItems,
  isComplete,
  totalScore,
  type Screener as ScreenerDef,
  type ScreenerResponses,
} from "@/lib/data/screeners";

type Props = {
  def: ScreenerDef;
  responses: ScreenerResponses;
  onChange: (next: ScreenerResponses) => void;
  compact?: boolean;
};

const severityTone: Record<string, "success" | "warning" | "error"> = {
  none: "success",
  mild: "success",
  moderate: "warning",
  modSevere: "warning",
  severe: "error",
};

export function Screener({ def, responses, onChange, compact }: Props) {
  const total = totalScore(responses, def.items.length);
  const band = bandFor(total, def.bands);
  const complete = isComplete(responses, def.items.length);
  const flagged = flagItems(responses, def);

  return (
    <Card variant={compact ? "default" : "aurora"}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="overline">{def.short}</div>
          <div
            className="font-display mt-1 text-base text-white"
            style={{ fontVariationSettings: "'opsz' 72" }}
          >
            {def.name}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl tabular-nums text-white">
            {complete ? total : "—"}
          </div>
          {band && complete && (
            <Badge tone={severityTone[band.severity] ?? "neutral"}>
              {band.label}
            </Badge>
          )}
          {flagged.length > 0 && (
            <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--error-soft)]">
              safety flag
            </div>
          )}
        </div>
      </div>

      <p className="mt-2 text-xs text-[var(--ink-3)]">{def.description}</p>

      <ol className="mt-3 space-y-2">
        {def.items.map((item, i) => {
          const selected = responses[i];
          return (
            <li
              key={i}
              className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2.5"
            >
              <div className="flex items-start gap-3 text-sm">
                <span className="font-mono shrink-0 text-[11px] tabular-nums text-[var(--ink-4)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <p className="text-[var(--ink-2)]">{item.prompt}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.options.map((opt) => {
                      const isOn = selected === opt.value;
                      const triggersFlag =
                        def.flagThreshold !== undefined &&
                        opt.value >= def.flagThreshold &&
                        // PHQ-9 only flags item 9 (index 8)
                        (def.id !== "phq9" || i === 8);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            onChange({ ...responses, [i]: opt.value })
                          }
                          className={`rounded-full border px-3 py-1 text-[11px] transition ${
                            isOn
                              ? triggersFlag
                                ? "border-[var(--error)]/60 bg-[var(--error)]/[0.14] text-[var(--error-soft)]"
                                : "border-[var(--violet)]/60 bg-[var(--violet)]/[0.12] text-white"
                              : "border-white/[0.06] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
                          }`}
                        >
                          {opt.label}
                          <span className="ml-1 font-mono text-[10px] tabular-nums text-[var(--ink-4)]">
                            {opt.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
