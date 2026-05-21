"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  clearLog,
  readLog,
  summarize,
  type CallLogEntry,
  type CallLogSummary,
  type CallOutcome,
} from "@/lib/data/callLog";

const OUTCOME_LABEL: Record<CallOutcome, string> = {
  placed: "Placed",
  referred: "Referred",
  "scheduled-followup": "Follow-up",
  lost: "Lost",
  "in-progress": "Active",
};

const OUTCOME_TONE: Record<CallOutcome, "success" | "violet" | "warning" | "error" | "neutral"> = {
  placed: "success",
  referred: "violet",
  "scheduled-followup": "warning",
  lost: "error",
  "in-progress": "neutral",
};

function formatDuration(sec: number): string {
  if (sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AnalyticsClient() {
  const [log, setLog] = useState<CallLogEntry[]>([]);
  const [summary, setSummary] = useState<CallLogSummary | null>(null);

  useEffect(() => {
    const l = readLog();
    setLog(l);
    setSummary(summarize(l));
  }, []);

  const handleClear = () => {
    if (!confirm("Clear all locally logged calls?")) return;
    clearLog();
    setLog([]);
    setSummary(summarize([]));
  };

  if (!summary) return null;

  const placeRate =
    summary.total > 0
      ? Math.round((summary.byOutcome.placed / summary.total) * 100)
      : 0;
  const maxOutcome = Math.max(
    summary.byOutcome.placed,
    summary.byOutcome.referred,
    summary.byOutcome.lost,
    summary.byOutcome["scheduled-followup"],
    1
  );
  const maxLight = Math.max(
    summary.byLight.GREEN,
    summary.byLight.YELLOW,
    summary.byLight.RED,
    1
  );
  const maxPayor = Math.max(...summary.topPayors.map((p) => p.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <div className="overline">Calls logged</div>
          <div className="font-mono mt-1 text-3xl tabular-nums text-white">
            {summary.total}
          </div>
        </Card>
        <Card>
          <div className="overline">Avg duration</div>
          <div className="font-mono mt-1 text-3xl tabular-nums text-white">
            {formatDuration(summary.durationAvgSec)}
          </div>
        </Card>
        <Card>
          <div className="overline">Placement rate</div>
          <div className="font-mono mt-1 text-3xl tabular-nums text-[var(--success)]">
            {placeRate}%
          </div>
        </Card>
        <Card>
          <div className="overline">RED flags total</div>
          <div className="font-mono mt-1 text-3xl tabular-nums text-[var(--error-soft)]">
            {summary.redFlags}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card variant="aurora">
          <div className="overline mb-3">Outcome breakdown</div>
          <div className="space-y-2.5">
            {(Object.keys(summary.byOutcome) as CallOutcome[]).map((o) => {
              const n = summary.byOutcome[o];
              const pct = (n / maxOutcome) * 100;
              return (
                <div key={o}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="text-[var(--ink-2)]">{OUTCOME_LABEL[o]}</span>
                    <span className="font-mono text-white tabular-nums">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background:
                          o === "placed"
                            ? "linear-gradient(90deg, var(--success), var(--periwinkle))"
                            : o === "referred"
                              ? "linear-gradient(90deg, var(--violet), var(--periwinkle))"
                              : o === "scheduled-followup"
                                ? "linear-gradient(90deg, var(--warning), var(--copper-bright))"
                                : "linear-gradient(90deg, var(--error), var(--copper))",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card variant="aurora">
          <div className="overline mb-3">Tier breakdown</div>
          <div className="space-y-2.5">
            {(["GREEN", "YELLOW", "RED"] as const).map((light) => {
              const n = summary.byLight[light];
              const pct = (n / maxLight) * 100;
              return (
                <div key={light}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <Badge tone={light}>{light}</Badge>
                    <span className="font-mono text-white tabular-nums">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background:
                          light === "GREEN"
                            ? "var(--success)"
                            : light === "YELLOW"
                              ? "var(--warning)"
                              : "var(--error-soft)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card variant="aurora">
        <div className="overline mb-3">Top payors by volume</div>
        {summary.topPayors.length === 0 ? (
          <p className="text-xs text-[var(--ink-3)]">
            No payor activity yet — start a call and pick an insurance to populate.
          </p>
        ) : (
          <div className="space-y-2.5">
            {summary.topPayors.map((p) => {
              const pct = (p.count / maxPayor) * 100;
              return (
                <div key={p.name}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="truncate text-[var(--ink-2)]">{p.name}</span>
                    <span className="font-mono text-white tabular-nums">
                      {p.count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background:
                          "linear-gradient(90deg, var(--violet), var(--copper-bright))",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card variant="flat">
        <div className="mb-3 flex items-center justify-between">
          <div className="overline">Recent calls</div>
          <Button variant="utility" size="sm" onClick={handleClear}>
            Clear local log
          </Button>
        </div>
        {log.length === 0 ? (
          <p className="text-xs text-[var(--ink-3)]">
            Nothing logged yet. End a call from the cockpit using one of the
            Log buttons (Placed / Referred / Lost) and entries land here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    When
                  </th>
                  <th className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    Duration
                  </th>
                  <th className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    Payor
                  </th>
                  <th className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    Acuity
                  </th>
                  <th className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    Outcome
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    Flags
                  </th>
                </tr>
              </thead>
              <tbody>
                {log.slice(0, 25).map((e) => (
                  <tr key={e.id} className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 align-top font-mono text-[11px] tabular-nums text-[var(--ink-3)]">
                      {new Date(e.endedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-[var(--ink-2)] tabular-nums">
                      {formatDuration(e.durationSec)}
                    </td>
                    <td className="px-3 py-2 align-top text-[var(--ink-2)]">
                      {e.payorPlan || "—"}
                      {e.payorLight && (
                        <span className="ml-2 align-middle">
                          <Badge tone={e.payorLight}>{e.payorLight}</Badge>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Badge tone={e.acuity}>{e.acuity}</Badge>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Badge tone={OUTCOME_TONE[e.outcome]}>
                        {OUTCOME_LABEL[e.outcome]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right align-top font-mono text-xs tabular-nums">
                      <span className="text-[var(--error-soft)]">{e.flagsRed}R</span>
                      <span className="ml-1 text-[var(--warning)]">{e.flagsYellow}Y</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
