"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DEMO_SCENARIOS, type PayorSummary } from "@/lib/data/demoScenarios";
import { CLAIMS_TIERS } from "@/lib/data/claimsTiers";

type Selection = { name: string; summary: PayorSummary } | null;

type Props = {
  value: Selection;
  onSelect: (s: Selection) => void;
};

/** Until tenant-imported payors land, the cockpit demos against the three
 *  scenario payors. This keeps the surface fully usable in v0. */
const SEED_PAYORS = DEMO_SCENARIOS.map((d) => ({
  name: d.insurance,
  summary: d.payor,
}));

export function InsuranceIntel({ value, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEED_PAYORS;
    return SEED_PAYORS.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  const tier = value ? CLAIMS_TIERS[value.summary.light] : null;

  return (
    <Card variant="aurora" className="flex flex-col gap-4">
      <div>
        <div className="overline mb-2">Insurance intel</div>
        <Input
          placeholder="Cigna MRC, Aetna FCR, UHC Navigate…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {matches.length > 0 && query && !value && (
          <ul className="mt-2 space-y-1">
            {matches.map((p) => (
              <li key={p.name}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-sm text-[var(--ink-2)] transition hover:border-white/[0.14] hover:text-white"
                >
                  <span>{p.name}</span>
                  <Badge tone={p.summary.light}>{p.summary.light}</Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {value ? (
        <>
          <div className="flex items-start justify-between border-t border-white/[0.06] pt-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Current payor
              </div>
              <div
                className="font-display mt-1 text-xl text-white"
                style={{ fontVariationSettings: "'opsz' 72" }}
              >
                {value.name}
              </div>
            </div>
            <Badge tone={value.summary.light}>{value.summary.light}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ["OON %", value.summary.oonPct],
              ["Admit rule", value.summary.admitRule],
              ["LOS sweet spot", `${value.summary.losDays} days`],
              ["Est. / day", value.summary.estPerDay],
              ["Denial prob.", value.summary.denialProb],
              ["Appeal ROI", value.summary.appealROI],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2"
              >
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  {k}
                </div>
                <div className="mt-0.5 font-mono text-[13px] tabular-nums text-white">
                  {v}
                </div>
              </div>
            ))}
          </div>

          {tier && (
            <div className="border-t border-white/[0.06] pt-4">
              <div className="overline mb-2">Claims playbook · {tier.label}</div>
              <p className="mb-3 text-xs italic text-[var(--ink-2)]">
                {tier.strategy}
              </p>
              <ol className="space-y-2">
                {tier.phases.map((p) => (
                  <li
                    key={p.phase}
                    className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2 text-xs"
                  >
                    <div className="flex-1">
                      <div className="text-white">{p.phase}</div>
                      <div className="text-[var(--ink-3)]">{p.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[11px] tabular-nums text-[var(--periwinkle)]">
                        {p.timeline}
                      </div>
                      <div className="font-mono text-[11px] tabular-nums text-white">
                        {p.rate}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-left text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-white"
          >
            Clear payor →
          </button>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.01] px-3 py-6 text-center text-xs text-[var(--ink-3)]">
          Pick a payor to load light, claims tier, and SOP routing.
        </div>
      )}
    </Card>
  );
}
