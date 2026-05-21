"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PaaState } from "@/lib/data/paaSchema";
import type { SafetyFlag } from "./SafetyFlags";
import { recommendLoc, asamAcuityLight } from "@/lib/data/asam";
import { totalScore, bandFor, PHQ9, GAD7 } from "@/lib/data/screeners";

const PHI_FIELDS: Array<keyof PaaState> = [
  "name",
  "dob",
  "address",
  "contactValue",
  "conservatorContact",
];

function sanitizeForNarrative(state: PaaState): Partial<PaaState> {
  const copy: Partial<PaaState> = { ...state };
  for (const f of PHI_FIELDS) {
    if (typeof copy[f] === "string") (copy as Record<string, unknown>)[f] = "";
  }
  return copy;
}

type Props = {
  state: PaaState;
  flags: SafetyFlag[];
};

export function HandoffCard({ state, flags }: Props) {
  const [copied, setCopied] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const generateNarrative = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const r = await fetch("/api/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "advisor.narrative",
          payload: { assessment: sanitizeForNarrative(state) },
        }),
      });
      const j = (await r.json()) as
        | { ok: true; narrative: string }
        | { ok: false; error: string };
      if (j.ok) setNarrative(j.narrative);
      else setGenError(j.error);
    } catch (e) {
      setGenError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const loc = recommendLoc(state.asam);
  const acuity = asamAcuityLight(state.asam);
  const phq = totalScore(state.phq9, 9);
  const gad = totalScore(state.gad7, 7);
  const phqBand = bandFor(phq, PHQ9.bands)?.label ?? "—";
  const gadBand = bandFor(gad, GAD7.bands)?.label ?? "—";

  const flagSeverity = flags.some((f) => f.light === "RED")
    ? "RED"
    : flags.some((f) => f.light === "YELLOW")
      ? "YELLOW"
      : "GREEN";

  const summary = buildSummary(state, flags, {
    loc: loc.level,
    locLabel: loc.label,
    phq,
    phqBand,
    gad,
    gadBand,
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <Card variant="aurora" className="handoff-print space-y-5 print:break-inside-avoid">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="overline">Clinical Handoff</div>
          <h3
            className="font-display mt-1 text-2xl text-white"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            Summary for clinical review
          </h3>
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            Redacted summary —{" "}
            {state.submittedAt
              ? new Date(state.submittedAt).toLocaleString()
              : new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={flagSeverity}>{flagSeverity} flags</Badge>
          <Badge tone={acuity}>{acuity} acuity</Badge>
          <Badge tone="violet">ASAM {loc.level}</Badge>
        </div>
      </div>

      {state.redactedSummary && (
        <div className="rounded-xl border border-[var(--periwinkle)]/30 bg-[var(--violet)]/[0.04] px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[var(--ink-2)]">
          {state.redactedSummary}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card>
          <div className="overline mb-1">Suggested LOC</div>
          <div className="flex items-baseline gap-2">
            <span
              className="hero-gradient-text font-display text-3xl"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              ASAM {loc.level}
            </span>
            <span className="text-sm text-white">{loc.label}</span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--ink-3)]">{loc.setting}</div>
        </Card>
        <Card>
          <div className="overline mb-1">Brief screeners</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--ink-2)]">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                PHQ-9
              </div>
              <div className="font-mono text-white">
                {phq} <span className="text-[var(--ink-3)]">· {phqBand}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                GAD-7
              </div>
              <div className="font-mono text-white">
                {gad} <span className="text-[var(--ink-3)]">· {gadBand}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {flags.length > 0 && (
        <Card variant="flat" className="border-[var(--warning)]/30">
          <div className="overline mb-2">Safety flags</div>
          <ul className="space-y-1.5">
            {flags.map((f) => (
              <li
                key={f.id}
                className="flex items-start gap-3 text-xs text-[var(--ink-2)]"
              >
                <Badge tone={f.light}>{f.label}</Badge>
                <span>{f.detail}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card variant="flat">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <div className="overline">Clinical narrative</div>
          {narrative && (
            <button
              type="button"
              onClick={generateNarrative}
              disabled={generating}
              className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-white print:hidden"
            >
              {generating ? "regenerating…" : "regenerate"}
            </button>
          )}
        </div>
        {narrative ? (
          <p className="font-display whitespace-pre-line text-[14px] leading-relaxed text-[var(--ink-2)]" style={{ fontVariationSettings: "'opsz' 72" }}>
            {narrative}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <Button onClick={generateNarrative} size="sm" disabled={generating}>
              {generating ? "Generating…" : "Generate clinical narrative"}
            </Button>
            <span className="text-[11px] text-[var(--ink-3)]">
              Biopsychosocial paragraph from the redacted assessment. PHI fields
              stripped before send.
            </span>
          </div>
        )}
        {genError && (
          <p className="mt-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/[0.06] px-3 py-2 text-xs text-[var(--error-soft)] print:hidden">
            {genError}
          </p>
        )}
      </Card>

      <Card variant="flat">
        <div className="overline mb-2">ASAM dimensions</div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["intox", "Intox/WD"],
              ["biomed", "Biomed"],
              ["emotional", "Emotional"],
              ["readiness", "Readiness"],
              ["relapse", "Relapse"],
              ["environment", "Environment"],
            ] as const
          ).map(([k, label]) => (
            <div
              key={k}
              className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-2 py-1.5 text-center"
            >
              <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                {label}
              </div>
              <div
                className="font-mono text-lg"
                style={{
                  color:
                    state.asam[k] >= 3
                      ? "var(--error-soft)"
                      : state.asam[k] >= 2
                        ? "var(--warning)"
                        : "var(--success)",
                }}
              >
                {state.asam[k]}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button onClick={copy}>{copied ? "Copied ✓" : "Copy summary"}</Button>
        <Button variant="ghost" onClick={() => window.print()}>
          Print
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            const subject = encodeURIComponent(
              "Clinical handoff — admissions intake"
            );
            const body = encodeURIComponent(summary);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
          }}
        >
          Email (redacted)
        </Button>
      </div>
    </Card>
  );
}

function buildSummary(
  s: PaaState,
  flags: SafetyFlag[],
  meta: {
    loc: string;
    locLabel: string;
    phq: number;
    phqBand: string;
    gad: number;
    gadBand: string;
  }
): string {
  if (s.redactedSummary) return s.redactedSummary;

  const lines: string[] = [];
  lines.push("CLINICAL HANDOFF — ADMISSIONS INTAKE (preliminary, redacted)");
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push(`Suggested LOC: ASAM ${meta.loc} — ${meta.locLabel}`);
  lines.push(
    `Screeners: PHQ-9 ${meta.phq} (${meta.phqBand}) · GAD-7 ${meta.gad} (${meta.gadBand})`
  );
  if (flags.length > 0) {
    lines.push("");
    lines.push("Safety flags:");
    flags.forEach((f) => lines.push(`  - [${f.light}] ${f.label} — ${f.detail}`));
  }
  if (s.presentingFactor) {
    lines.push("");
    lines.push("Presenting:");
    lines.push(`  ${s.presentingFactor}`);
  }
  if (s.primaryDx || s.mhDx) {
    lines.push("");
    lines.push(`Dx: ${s.primaryDx || "—"} · ${s.mhDx || "—"}`);
  }
  const subs = Object.keys(s.substances).filter(
    (k) =>
      s.substances[k]?.frequency ||
      s.substances[k]?.lastUse ||
      s.substances[k]?.amount
  );
  if (subs.length > 0) {
    lines.push("");
    lines.push("Substance use:");
    subs.forEach((k) =>
      lines.push(
        `  ${k} — ${s.substances[k].frequency || "?"} · last ${
          s.substances[k].lastUse || "?"
        }`
      )
    );
  }
  if (s.withdrawalRisk !== "none") {
    lines.push(`Withdrawal risk: ${s.withdrawalRisk.toUpperCase()}`);
  }
  if (s.treatmentGoals) {
    lines.push("");
    lines.push("Goals (caller words):");
    lines.push(`  ${s.treatmentGoals}`);
  }
  if (s.repNotes) {
    lines.push("");
    lines.push("Rep notes:");
    lines.push(`  ${s.repNotes}`);
  }
  return lines.join("\n");
}
