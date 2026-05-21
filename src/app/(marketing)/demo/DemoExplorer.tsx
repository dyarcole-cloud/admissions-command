"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DemoScenario } from "@/lib/data/demoScenarios";

export function DemoExplorer({ scenarios }: { scenarios: DemoScenario[] }) {
  const [activeId, setActiveId] = useState(scenarios[0].id);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const active =
    scenarios.find((s) => s.id === activeId) ?? scenarios[0];

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [activeId]);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setStepIdx((p) => {
          if (p >= active.steps.length - 1) {
            setPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, 2500);
    } else if (timer.current) {
      clearInterval(timer.current);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, active]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {/* Scenario picker */}
      <div className="flex flex-row gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
        {scenarios.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={`flex w-64 shrink-0 flex-col rounded-2xl border p-4 text-left transition lg:w-full ${
                isActive
                  ? "border-[var(--violet)]/50 bg-white/[0.04]"
                  : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.14]"
              }`}
            >
              <Badge tone={s.light}>{s.light}</Badge>
              <div
                className="font-display mt-3 text-lg leading-tight text-white"
                style={{ fontVariationSettings: "'opsz' 72" }}
              >
                {s.title}
              </div>
              <div className="mt-1 text-xs text-[var(--ink-3)]">{s.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Active scenario detail */}
      <div className="space-y-4">
        <Card variant="aurora">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge tone={active.light}>{active.light}</Badge>
              <h2
                className="font-display mt-2 text-2xl text-white"
                style={{ fontVariationSettings: "'opsz' 96" }}
              >
                {active.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-2)]">
                Caller: <span className="text-white">{active.caller}</span> ·{" "}
                {active.insurance}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-3)]">
                Impact
              </div>
              <div
                className="font-display text-2xl text-white"
                style={{ fontVariationSettings: "'opsz' 96" }}
              >
                {active.savings.split(" ")[0]}
              </div>
              <div className="text-xs text-[var(--ink-3)]">
                {active.savings.split(" ").slice(1).join(" ")}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/app?scenario=${active.id}`}>
              <Button size="sm">Open this scenario in the cockpit →</Button>
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--error-soft)]">
              Without Admissions Command
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">
              {active.withoutTool}
            </p>
          </Card>
          <Card>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--success)]">
              With Admissions Command
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">
              {active.withTool}
            </p>
          </Card>
        </div>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="overline">Call timeline</div>
            <Button
              variant="utility"
              size="sm"
              onClick={() => {
                if (stepIdx >= active.steps.length - 1) {
                  setStepIdx(0);
                  setPlaying(true);
                } else {
                  setPlaying((p) => !p);
                }
              }}
            >
              {playing
                ? "Pause"
                : stepIdx >= active.steps.length - 1
                  ? "Replay"
                  : "Play through"}
            </Button>
          </div>
          <ol className="space-y-2">
            {active.steps.map((s, i) => {
              const isCurrent = i === stepIdx;
              const isPast = i < stepIdx;
              return (
                <li
                  key={s.time + i}
                  className={`flex gap-4 rounded-xl border px-4 py-3 transition ${
                    isCurrent
                      ? "border-[var(--violet)]/50 bg-[var(--violet)]/[0.06]"
                      : isPast
                        ? "border-white/[0.06] bg-white/[0.015] opacity-60"
                        : "border-white/[0.06] bg-white/[0.015]"
                  }`}
                >
                  <span className="font-mono w-12 shrink-0 text-xs tabular-nums text-[var(--ink-3)]">
                    {s.time}
                  </span>
                  <div className="text-sm text-[var(--ink-2)]">
                    {s.action}
                    {s.result && (
                      <div className="mt-1 text-xs text-[var(--periwinkle)]">
                        → {s.result}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>
    </div>
  );
}
