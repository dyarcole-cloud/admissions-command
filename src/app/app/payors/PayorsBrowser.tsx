"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Light } from "@/lib/utils";
import type { Payor, RowCategory } from "@/lib/data/payors";

type SearchResponse = {
  ok: true;
  count: number;
  total: number;
  results: Payor[];
};

const LIGHTS: Array<Light | "ALL"> = ["ALL", "GREEN", "YELLOW", "RED"];
const CATEGORIES: Array<RowCategory | "ALL"> = [
  "ALL",
  "Commercial Carrier",
  "Medicaid",
  "Union / Public Sector",
  "Government / Military",
  "Legacy",
];

const PAGE_SIZE = 25;

type Props = {
  initialResults: Payor[];
  initialTotal: number;
};

export function PayorsBrowser({ initialResults, initialTotal }: Props) {
  const [q, setQ] = useState("");
  const [light, setLight] = useState<Light | "ALL">("ALL");
  const [category, setCategory] = useState<RowCategory | "ALL">("ALL");
  const [results, setResults] = useState<Payor[]>(initialResults);
  const [filteredTotal, setFilteredTotal] = useState<number>(initialTotal);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (light !== "ALL") params.set("light", light);
    if (category !== "ALL") params.set("category", category);
    params.set("limit", "500");
    const t = setTimeout(() => {
      fetch(`/api/payors?${params.toString()}`)
        .then((r) => r.json() as Promise<SearchResponse>)
        .then((j) => {
          if (j.ok) {
            setResults(j.results);
            setFilteredTotal(j.count);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 160);
    return () => clearTimeout(t);
  }, [q, light, category]);

  const paged = useMemo(
    () => results.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [results, page]
  );
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card variant="flat" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <div className="overline mb-1.5">Search</div>
            <Input
              placeholder="Cigna, Aetna, Anthem, UHC, BCBS, employer prefix…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
            Light
          </span>
          {LIGHTS.map((l) => {
            const active = light === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLight(l)}
                className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition ${
                  active
                    ? l === "ALL"
                      ? "border-[var(--violet)]/60 bg-[var(--violet)]/[0.12] text-white"
                      : l === "GREEN"
                        ? "border-[var(--success)]/50 bg-[var(--success)]/[0.12] text-[var(--success)]"
                        : l === "YELLOW"
                          ? "border-[var(--warning)]/50 bg-[var(--warning)]/[0.12] text-[var(--warning)]"
                          : "border-[var(--error)]/50 bg-[var(--error)]/[0.12] text-[var(--error-soft)]"
                    : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
            Category
          </span>
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1 text-[11px] tracking-[0.04em] transition ${
                  active
                    ? "border-[var(--periwinkle)]/50 bg-[var(--violet)]/[0.10] text-white"
                    : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Results meta */}
      <div className="flex items-baseline justify-between px-1 text-xs text-[var(--ink-3)]">
        <div>
          {loading ? (
            <span className="text-[var(--periwinkle)]">searching…</span>
          ) : (
            <>
              <span className="font-mono tabular-nums text-white">
                {filteredTotal}
              </span>{" "}
              of {initialTotal} payors
            </>
          )}
        </div>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="utility"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ←
            </Button>
            <span className="font-mono tabular-nums">
              {page + 1} / {pageCount}
            </span>
            <Button
              size="sm"
              variant="utility"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
            >
              →
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card variant="flat" className="overflow-x-auto p-0">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Plan
              </th>
              <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Light
              </th>
              <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Category
              </th>
              <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Admit rule
              </th>
              <th className="px-3 py-3 text-right text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                OON %
              </th>
              <th className="px-3 py-3 text-right text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Est / day
              </th>
              <th className="px-3 py-3 text-right text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                LOS
              </th>
              <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Appeal ROI
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => {
              const open = openId === p.id;
              return (
                <Fragment key={p.id}>
                  <tr
                    className="cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                    onClick={() => setOpenId(open ? null : p.id)}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="text-white">{p.plan || p.parent}</div>
                      <div className="text-[11px] text-[var(--ink-3)]">
                        {p.parent}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <Badge tone={p.light}>{p.light}</Badge>
                    </td>
                    <td className="px-3 py-3 align-top text-[var(--ink-2)]">
                      {p.rowCategory}
                    </td>
                    <td className="px-3 py-3 align-top text-[var(--ink-2)]">
                      {p.admitRule || "—"}
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono tabular-nums text-[var(--ink-2)]">
                      {p.oonPct || "—"}
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono tabular-nums text-white">
                      {p.estPerDay || "—"}
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono tabular-nums text-[var(--ink-2)]">
                      {p.losDays || "—"}
                    </td>
                    <td className="px-3 py-3 align-top">
                      {p.appealRoi ? (
                        <Badge
                          tone={
                            p.appealRoi === "HIGH"
                              ? "success"
                              : p.appealRoi === "MEDIUM"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {p.appealRoi}
                        </Badge>
                      ) : (
                        <span className="text-[var(--ink-4)]">—</span>
                      )}
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-white/[0.04]">
                      <td colSpan={8} className="bg-[var(--bg-deep)]/40 px-4 py-4">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                          {[
                            ["Card clues", p.cardClues],
                            ["ID pattern", p.idPattern],
                            ["Decision status", p.decisionStatus],
                            ["Exception authority", p.exceptionAuthority],
                            ["Appeal priority", p.appealPriority],
                            ["Denial pattern", p.denialPattern],
                            ["Prior auth", p.priorAuthRequired],
                            ["Timely filing (days)", p.timelyFilingDays],
                            ["Med necessity threshold", p.medNecessityThreshold],
                            ["Network leakage risk", p.networkLeakageRisk],
                            ["Contractual opportunity", p.contractualOpportunity],
                            ["Volume potential", p.volumePotential],
                            ["Strategic priority", p.strategicPriority],
                            ["Confidence", p.confidenceTag],
                            ["Observed in network", p.observedInNetwork],
                            ["Last updated", p.lastUpdated],
                            ["Service line", p.serviceLineScope],
                          ]
                            .filter(([, v]) => v)
                            .map(([k, v]) => (
                              <div key={k} className="text-xs">
                                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                                  {k}
                                </div>
                                <div className="mt-0.5 text-[var(--ink-2)]">{v}</div>
                              </div>
                            ))}
                        </div>
                        {p.appealNotes && (
                          <p className="mt-3 rounded-lg border border-[var(--periwinkle)]/20 bg-[var(--violet)]/[0.06] px-3 py-2 text-xs italic leading-relaxed text-[var(--ink-2)]">
                            {p.appealNotes}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
