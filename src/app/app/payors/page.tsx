import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CLAIMS_TIERS } from "@/lib/data/claimsTiers";
import { searchPayors, payorCounts } from "@/lib/data/payors";
import { PayorsBrowser } from "./PayorsBrowser";

export const metadata: Metadata = { title: "Payor Engine" };

export default function PayorsPage() {
  const counts = payorCounts();
  const initial = searchPayors({ limit: 500 });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="overline">Payor Engine · ANTN Matrix 2026.04</span>
          <h1
            className="font-display mt-1 text-3xl text-white"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            Payors
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ink-2)]">
            Light-tiered playbook across {counts.total.toLocaleString()} plans —
            commercial, Medicaid, union, government/military, and legacy
            references. Click any row to expand the full record.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Card className="px-4 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
              Green
            </div>
            <div className="font-mono text-2xl tabular-nums text-[var(--success)]">
              {counts.byLight.GREEN.toLocaleString()}
            </div>
          </Card>
          <Card className="px-4 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
              Yellow
            </div>
            <div className="font-mono text-2xl tabular-nums text-[var(--warning)]">
              {counts.byLight.YELLOW.toLocaleString()}
            </div>
          </Card>
          <Card className="px-4 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
              Red
            </div>
            <div className="font-mono text-2xl tabular-nums text-[var(--error-soft)]">
              {counts.byLight.RED.toLocaleString()}
            </div>
          </Card>
        </div>
      </div>

      <PayorsBrowser initialResults={initial} initialTotal={counts.total} />

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
