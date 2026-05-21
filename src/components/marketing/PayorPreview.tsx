"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Payor } from "@/lib/data/payors";

type Response = { ok: true; count: number; total: number; results: Payor[] };

const PRESETS = ["Cigna", "Anthem", "Aetna", "BCBS", "Kaiser", "Medicaid"] as const;

export function PayorPreview() {
  const [q, setQ] = useState("Cigna");
  const [results, setResults] = useState<Payor[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/payors?q=${encodeURIComponent(q)}&limit=6`
        );
        const j = (await r.json()) as Response;
        if (j.ok) {
          setResults(j.results);
          setTotal(j.total);
        }
      } catch {}
      setLoading(false);
    }, 160);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <Card variant="aurora" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="overline">ANTN Payor Matrix · 2026.04</div>
          <h3
            className="font-display mt-1 text-xl text-white"
            style={{ fontVariationSettings: "'opsz' 72" }}
          >
            Try the live database
          </h3>
        </div>
        {total !== null && (
          <span className="font-mono text-[10px] tabular-nums text-[var(--ink-4)]">
            {total.toLocaleString()} plans loaded
          </span>
        )}
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cigna, Aetna, Anthem, UHC, BCBS, Medicaid…"
        autoComplete="off"
      />

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setQ(p)}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
              q === p
                ? "border-[var(--periwinkle)]/60 bg-[var(--violet)]/[0.12] text-white"
                : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <ul className="min-h-[180px] space-y-1.5">
        {loading && results.length === 0 ? (
          <li className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-[var(--ink-3)]">
            searching {total ? `${total.toLocaleString()} plans` : "matrix"}…
          </li>
        ) : results.length === 0 ? (
          <li className="rounded-lg border border-dashed border-white/[0.1] bg-white/[0.01] px-3 py-3 text-center text-xs text-[var(--ink-3)]">
            No matches for &quot;{q}&quot;
          </li>
        ) : (
          results.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <div className="truncate text-white">{p.plan || p.parent}</div>
                <div className="truncate text-[var(--ink-3)]">
                  {p.parent} · {p.rowCategory}
                </div>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-mono text-[11px] tabular-nums text-[var(--ink-2)]">
                  {p.estPerDay || "—"}
                </span>
                <Badge tone={p.light}>{p.light}</Badge>
              </div>
            </li>
          ))
        )}
      </ul>

      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-4)]">
        Light tier · admit rule · LOS · est/day · appeal ROI · 30 fields per
        record
      </p>
    </Card>
  );
}
