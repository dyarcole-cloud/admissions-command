"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CALL_SEGMENTS } from "@/lib/data/callSegments";
import { OBJECTIONS } from "@/lib/data/objections";
import { SOP_STEPS } from "@/lib/data/sopSteps";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InsuranceIntel } from "./InsuranceIntel";
import { AdvisorChat } from "./AdvisorChat";
import { AsamScorer } from "./AsamScorer";
import { RiskFlagStrip } from "./RiskFlagStrip";
import { MiPrompts } from "./MiPrompts";
import { useCrisis } from "@/components/app/CrisisProvider";
import { BLANK_ASAM_SCORES, asamAcuityLight, type AsamScores } from "@/lib/data/asam";
import type { Payor } from "@/lib/data/payors";
import { appendLog, type CallOutcome } from "@/lib/data/callLog";

const formatTime = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const segmentTone: Record<string, { glow: string; ring: string }> = {
  rapport: { glow: "rgba(167,139,250,0.55)", ring: "var(--violet)" },
  data: { glow: "rgba(196,181,253,0.55)", ring: "var(--periwinkle)" },
  clinical: { glow: "rgba(196,181,253,0.6)", ring: "var(--periwinkle)" },
  options: { glow: "rgba(234,88,12,0.55)", ring: "var(--copper-bright)" },
  commit: { glow: "rgba(167,139,250,0.55)", ring: "var(--violet)" },
};

export function CallCockpit() {
  const [segIdx, setSegIdx] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [payor, setPayor] = useState<Payor | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [objection, setObjection] = useState<string | null>(null);
  const [asam, setAsam] = useState<AsamScores>(BLANK_ASAM_SCORES);
  const [mobileView, setMobileView] = useState<"intel" | "segments" | "advisor">(
    "segments"
  );
  const crisis = useCrisis();
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSegment = CALL_SEGMENTS[segIdx];
  const tone = segmentTone[activeSegment.tone];
  const isClinicalSegment = activeSegment.tone === "clinical";

  useEffect(() => {
    if (startedAt) {
      interval.current = setInterval(() => {
        setElapsed(Date.now() - startedAt);
      }, 250);
    } else if (interval.current) {
      clearInterval(interval.current);
    }
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [startedAt]);

  const sopHighlight = useMemo(() => {
    if (!payor) return 1;
    if (payor.light === "GREEN") return 5;
    if (payor.light === "YELLOW") return 6;
    return 7;
  }, [payor]);

  const toggleCheck = (key: string) =>
    setChecklist((c) => ({ ...c, [key]: !c[key] }));

  const handleStart = () => {
    if (!startedAt) {
      setStartedAt(Date.now() - elapsed);
    } else {
      setStartedAt(null);
    }
  };

  const handleReset = () => {
    setStartedAt(null);
    setElapsed(0);
    setSegIdx(0);
    setChecklist({});
    setObjection(null);
    setAsam(BLANK_ASAM_SCORES);
    crisis.closeCrisis();
  };

  const logCall = (outcome: CallOutcome) => {
    if (elapsed < 5000 && !payor) return;
    const now = Date.now();
    const acuity = asamAcuityLight(asam);
    const asamMax = Math.max(...Object.values(asam));
    appendLog({
      id: crypto.randomUUID(),
      startedAt: startedAt ?? now - elapsed,
      endedAt: now,
      durationSec: Math.floor(elapsed / 1000),
      segmentsReached: segIdx + 1,
      payorPlan: payor ? payor.plan || payor.parent : null,
      payorParent: payor?.parent ?? null,
      payorLight: payor?.light ?? null,
      asamMax,
      acuity,
      outcome,
      flagsRed: [
        acuity === "RED",
        asam.intox >= 3,
        asam.emotional >= 3,
        asam.biomed >= 4,
      ].filter(Boolean).length,
      flagsYellow: [
        acuity === "YELLOW",
        asam.intox === 2,
        asam.emotional === 2,
        asam.biomed === 2 || asam.biomed === 3,
      ].filter(Boolean).length,
      rep: null,
    });
    handleReset();
  };

  const openCrisis = crisis.openCrisis;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="overline">Live call</span>
          <h1
            className="font-display mt-1 text-3xl text-white"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            Cockpit
            <span className="ml-2 align-middle">
              <Badge
                tone={payor ? payor.light : "neutral"}
                className="text-[10px]"
              >
                {payor ? payor.light : "no payor"}
              </Badge>
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="font-mono rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xl tabular-nums"
            style={{
              boxShadow: startedAt ? `0 0 24px ${tone.glow}` : "none",
              transition: "box-shadow 0.4s",
            }}
          >
            {formatTime(elapsed)}
          </div>
          <Button variant={startedAt ? "destructive" : "primary"} onClick={handleStart}>
            {startedAt ? "Pause" : elapsed > 0 ? "Resume" : "Start call"}
          </Button>
          {elapsed > 5000 && (
            <>
              <Button variant="utility" size="sm" onClick={() => logCall("placed")}>
                Log · Placed
              </Button>
              <Button variant="utility" size="sm" onClick={() => logCall("referred")}>
                Log · Referred
              </Button>
              <Button variant="utility" size="sm" onClick={() => logCall("lost")}>
                Log · Lost
              </Button>
            </>
          )}
          <Button variant="utility" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      <RiskFlagStrip
        scores={asam}
        payor={payor}
        crisisOpen={crisis.open}
        onOpenCrisis={openCrisis}
      />

      {/* Mobile/tablet column switcher — desktop shows all three side by side */}
      <div className="flex gap-1.5 xl:hidden">
        {(
          [
            { id: "intel", label: "Insurance" },
            { id: "segments", label: "Segments" },
            { id: "advisor", label: "Advisor" },
          ] as const
        ).map((t) => {
          const active = mobileView === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setMobileView(t.id)}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs uppercase tracking-[0.12em] transition ${
                active
                  ? "border-[var(--violet)]/60 bg-[var(--violet)]/[0.10] text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_1.25fr_1.05fr]">
        <div
          className={`xl:block ${mobileView === "intel" ? "block" : "hidden"}`}
        >
        <InsuranceIntel value={payor} onSelect={setPayor} />
        </div>

        <div
          className={`xl:block ${mobileView === "segments" ? "block" : "hidden"}`}
        >
        <Card variant="aurora" className="flex flex-col gap-5">
          <div>
            <div className="overline mb-3">Segments</div>
            <div className="grid grid-cols-5 gap-1">
              {CALL_SEGMENTS.map((s, i) => {
                const active = i === segIdx;
                const done = i < segIdx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSegIdx(i)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-[10px] uppercase tracking-[0.08em] transition ${
                      active
                        ? "border-[var(--violet)]/60 bg-[var(--violet)]/[0.08] text-white"
                        : done
                          ? "border-white/[0.06] bg-white/[0.015] text-[var(--ink-3)]"
                          : "border-white/[0.06] bg-white/[0.015] text-[var(--ink-2)] hover:border-white/[0.16]"
                    }`}
                  >
                    <span className="font-display text-base leading-none">
                      {s.glyph}
                    </span>
                    <span className="whitespace-nowrap text-[10px]">{s.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-[11px] text-[var(--ink-3)]">
              {activeSegment.name} · {activeSegment.time} · {activeSegment.objectives}
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <div className="overline mb-2">Script</div>
            <p
              className="font-display text-[15px] italic leading-relaxed text-white/90"
              style={{ fontVariationSettings: "'opsz' 72" }}
            >
              “{activeSegment.script}”
            </p>
          </div>

          {isClinicalSegment ? (
            <div className="border-t border-white/[0.06] pt-4">
              <AsamScorer scores={asam} onChange={setAsam} />
            </div>
          ) : (
            <div className="border-t border-white/[0.06] pt-4">
              <div className="overline mb-2">Checklist</div>
              <div className="space-y-1.5">
                {activeSegment.questions.map((q, qi) => {
                  const key = `${activeSegment.id}-${qi}`;
                  const checked = !!checklist[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleCheck(key)}
                      className="flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-white/[0.03]"
                    >
                      <span
                        className={`mt-[3px] flex size-4 shrink-0 items-center justify-center rounded border transition ${
                          checked
                            ? "border-[var(--violet)]/60 bg-[var(--violet)]/30"
                            : "border-white/[0.18] bg-transparent"
                        }`}
                      >
                        {checked && (
                          <span className="text-[10px] leading-none text-white">
                            ✓
                          </span>
                        )}
                      </span>
                      <span
                        className={
                          checked
                            ? "text-[var(--ink-3)] line-through"
                            : "text-[var(--ink-2)]"
                        }
                      >
                        {q}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 border-t border-white/[0.06] pt-4">
            <Button
              variant="utility"
              size="sm"
              onClick={() => setSegIdx((i) => Math.max(0, i - 1))}
              disabled={segIdx === 0}
            >
              ← Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setSegIdx((i) => Math.min(CALL_SEGMENTS.length - 1, i + 1))
              }
              disabled={segIdx === CALL_SEGMENTS.length - 1}
            >
              Next →
            </Button>
            <div className="ml-auto text-[11px] uppercase tracking-[0.18em] text-[var(--ink-3)]">
              {segIdx + 1} / {CALL_SEGMENTS.length}
            </div>
          </div>
        </Card>
        </div>

        <div
          className={`flex flex-col gap-4 xl:flex ${mobileView === "advisor" ? "flex" : "hidden xl:flex"}`}
        >
          <Card variant="aurora" className="flex h-full flex-col gap-3">
            <div className="overline">AI Advisor</div>
            <AdvisorChat
              context={{
                segment: activeSegment.id,
                segmentName: activeSegment.name,
                payorName: payor ? payor.plan || payor.parent : null,
                payorLight: payor?.light ?? null,
                checklist,
                objection,
              }}
            />
          </Card>

          <Card>
            <div className="overline mb-2">Objection library</div>
            <div className="space-y-1.5">
              {OBJECTIONS.map((o) => {
                const active = objection === o.trigger;
                return (
                  <button
                    key={o.trigger}
                    type="button"
                    onClick={() =>
                      setObjection((prev) =>
                        prev === o.trigger ? null : o.trigger
                      )
                    }
                    className={`block w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                      active
                        ? "border-[var(--violet)]/50 bg-[var(--violet)]/[0.06] text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.14]"
                    }`}
                  >
                    <div className="font-medium">“{o.trigger}”</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                      {o.strategy}
                    </div>
                  </button>
                );
              })}
            </div>
            {objection && (
              <p className="mt-3 rounded-lg border border-[var(--periwinkle)]/30 bg-[var(--violet)]/[0.06] px-3 py-2 text-xs italic leading-relaxed text-[var(--ink-2)]">
                {OBJECTIONS.find((o) => o.trigger === objection)?.script}
              </p>
            )}
          </Card>

          <MiPrompts segmentId={activeSegment.id} />
        </div>
      </div>

      <Card variant="flat">
        <div className="mb-3 flex items-center justify-between">
          <div className="overline">SOP — authorization path</div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
            highlighted by current payor light
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
          {SOP_STEPS.map((s) => {
            const active = s.step === sopHighlight;
            return (
              <div
                key={s.step}
                className={`rounded-lg border px-3 py-2 text-xs transition ${
                  active
                    ? "border-[var(--violet)]/60 bg-[var(--violet)]/[0.08]"
                    : "border-white/[0.05] bg-white/[0.015]"
                }`}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  step {s.step} · {s.role}
                </div>
                <div className="mt-1 text-[12px] text-[var(--ink-2)]">
                  {s.action}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}
