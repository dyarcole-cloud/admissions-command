import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CLAIMS_TIERS } from "@/lib/data/claimsTiers";
import { DEMO_SCENARIOS } from "@/lib/data/demoScenarios";

export const metadata: Metadata = { title: "Payor Engine" };

export default function PayorsPage() {
  const payors = DEMO_SCENARIOS.map((d) => ({
    name: d.insurance,
    summary: d.payor,
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="overline">Payor Engine</span>
        <h1
          className="font-display mt-1 text-3xl text-white"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          Payors
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-2)]">
          Light-tiered playbook per insurance plan. Seed data shown until
          tenant import lands in week 2 (CSV + JSON).
        </p>
      </div>

      <Card variant="flat">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Plan
                </th>
                <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Light
                </th>
                <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  OON %
                </th>
                <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Admit rule
                </th>
                <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  LOS days
                </th>
                <th className="px-3 py-3 text-right text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Est / day
                </th>
              </tr>
            </thead>
            <tbody>
              {payors.map((p) => (
                <tr
                  key={p.name}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  <td className="px-3 py-3 text-white">{p.name}</td>
                  <td className="px-3 py-3">
                    <Badge tone={p.summary.light}>{p.summary.light}</Badge>
                  </td>
                  <td className="px-3 py-3 font-mono text-[var(--ink-2)] tabular-nums">
                    {p.summary.oonPct}
                  </td>
                  <td className="px-3 py-3 text-[var(--ink-2)]">
                    {p.summary.admitRule}
                  </td>
                  <td className="px-3 py-3 font-mono text-[var(--ink-2)] tabular-nums">
                    {p.summary.losDays}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-white tabular-nums">
                    {p.summary.estPerDay}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(["GREEN", "YELLOW", "RED"] as const).map((light) => {
          const t = CLAIMS_TIERS[light];
          return (
            <Card key={light} variant="aurora">
              <Badge tone={light}>{t.label}</Badge>
              <p className="mt-2 text-xs italic text-[var(--ink-2)]">
                {t.strategy}
              </p>
              <ol className="mt-3 space-y-1.5 text-xs text-[var(--ink-2)]">
                {t.phases.map((ph) => (
                  <li
                    key={ph.phase}
                    className="flex items-baseline justify-between gap-2"
                  >
                    <span>
                      <span className="text-white">{ph.phase}</span>{" "}
                      <span className="text-[var(--ink-3)]">· {ph.timeline}</span>
                    </span>
                    <span className="font-mono tabular-nums text-[var(--periwinkle)]">
                      {ph.rate}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
