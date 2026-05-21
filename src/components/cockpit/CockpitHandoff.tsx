"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { recommendLoc, asamAcuityLight, type AsamScores } from "@/lib/data/asam";
import type { Payor } from "@/lib/data/payors";
import type { Light } from "@/lib/utils";

type Alert = { label: string; light: Light; detail: string };

type Props = {
  open: boolean;
  onClose: () => void;
  payor: Payor | null;
  asam: AsamScores;
  segmentsReached: number;
  alerts: string[];
  advisorTranscript: Array<{ role: "user" | "assistant"; content: string }>;
  callDurationSec: number;
  objection: string | null;
};

export function CockpitHandoff({
  open,
  onClose,
  payor,
  asam,
  segmentsReached,
  alerts,
  advisorTranscript,
  callDurationSec,
  objection,
}: Props) {
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => {
    const lines: string[] = [];
    lines.push("ADMISSIONS CALL HANDOFF (cockpit-side, redacted)");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push(
      `Duration: ${Math.floor(callDurationSec / 60)}m ${callDurationSec % 60}s · Segments reached: ${segmentsReached} / 5`
    );
    lines.push("");
    if (payor) {
      lines.push(`PAYOR: ${payor.parent}${payor.plan ? ` — ${payor.plan}` : ""}`);
      lines.push(
        `  Light: ${payor.light}${payor.admitRule ? ` · Admit rule: ${payor.admitRule}` : ""}${payor.oonPct ? ` · OON: ${payor.oonPct}` : ""}`
      );
      if (payor.losDays) lines.push(`  LOS sweet spot: ${payor.losDays}`);
      if (payor.estPerDay) lines.push(`  Est $/day: ${payor.estPerDay}`);
      if (payor.appealRoi) lines.push(`  Appeal ROI: ${payor.appealRoi}`);
      lines.push("");
    } else {
      lines.push("PAYOR: not identified");
      lines.push("");
    }
    const loc = recommendLoc(asam);
    const acuity = asamAcuityLight(asam);
    lines.push(`ASAM dimensional scoring (caller acuity: ${acuity}):`);
    lines.push(
      `  Intox/WD ${asam.intox} · Biomed ${asam.biomed} · Emotional ${asam.emotional} · Readiness ${asam.readiness} · Relapse ${asam.relapse} · Environment ${asam.environment}`
    );
    lines.push(`  Suggested LOC: ASAM ${loc.level} — ${loc.label} (${loc.setting})`);
    lines.push("");
    if (alerts.length > 0) {
      lines.push("Clinical alerts:");
      alerts.forEach((a) => lines.push(`  - ${a}`));
      lines.push("");
    }
    if (objection) {
      lines.push(`Active objection at end-of-call: "${objection}"`);
      lines.push("");
    }
    if (advisorTranscript.length > 0) {
      lines.push("Advisor exchanges (last 4):");
      advisorTranscript.slice(-4).forEach((m) => {
        lines.push(`  [${m.role}] ${m.content.replace(/\n/g, " ").slice(0, 240)}`);
      });
      lines.push("");
    }
    lines.push(
      "Generated from the cockpit — no PHI captured here. Full intake instrument lives in the Pre-Admit module."
    );
    return lines.join("\n");
  }, [payor, asam, segmentsReached, alerts, advisorTranscript, callDurationSec, objection]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  if (!open) return null;

  const loc = recommendLoc(asam);
  const acuity = asamAcuityLight(asam);

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center px-4 py-8 print:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[var(--bg-deep)]/90 backdrop-blur-xl"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="card-aurora handoff-print relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="overline">Cockpit handoff</div>
            <h2
              className="font-display mt-1 text-2xl text-white"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              Summary for clinical
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={acuity}>{acuity} acuity</Badge>
            <Badge tone="violet">ASAM {loc.level}</Badge>
            {payor && <Badge tone={payor.light}>{payor.light} payor</Badge>}
          </div>
        </div>
        <pre className="flex-1 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 font-mono text-xs leading-relaxed text-[var(--ink-2)] whitespace-pre-wrap">
          {summary}
        </pre>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <Button onClick={copy}>{copied ? "Copied ✓" : "Copy summary"}</Button>
          <Button variant="ghost" onClick={() => window.print()}>
            Print
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const subject = encodeURIComponent("Admissions handoff — cockpit-side summary");
              const body = encodeURIComponent(summary);
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
          >
            Email
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const token = crypto.randomUUID();
              const url = `${window.location.origin}/follow-up/${token}`;
              navigator.clipboard.writeText(url).catch(() => {});
              window.open(url, "_blank", "noopener");
            }}
          >
            Caller follow-up (EN)
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const token = crypto.randomUUID();
              const url = `${window.location.origin}/follow-up/${token}?lang=es`;
              navigator.clipboard.writeText(url).catch(() => {});
              window.open(url, "_blank", "noopener");
            }}
          >
            Caller follow-up (ES)
          </Button>
          <Button variant="utility" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
