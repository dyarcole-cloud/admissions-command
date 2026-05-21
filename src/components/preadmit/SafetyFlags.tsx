"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Light } from "@/lib/utils";
import type { PaaState } from "@/lib/data/paaSchema";
import {
  CSSRS_LITE,
  PHQ9,
  flagItems,
  totalScore,
} from "@/lib/data/screeners";
import { asamAcuityLight } from "@/lib/data/asam";

export type SafetyFlag = {
  id: string;
  label: string;
  light: Light;
  detail: string;
};

export function deriveFlags(s: PaaState): SafetyFlag[] {
  const flags: SafetyFlag[] = [];

  // PHQ-9 item 9 (suicidality)
  const phqFlag = flagItems(s.phq9, PHQ9);
  if (phqFlag.length > 0) {
    flags.push({
      id: "phq-suicidality",
      label: "PHQ-9 item 9",
      light: phqFlag[0].value >= 2 ? "RED" : "YELLOW",
      detail: "Thoughts of self-harm or being better off dead",
    });
  }

  // C-SSRS any yes
  const cssrsFlag = flagItems(s.cssrs, CSSRS_LITE);
  if (cssrsFlag.length > 0) {
    const max = Math.max(...cssrsFlag.map((f) => f.idx));
    flags.push({
      id: "cssrs",
      label: "C-SSRS",
      light: max >= 3 ? "RED" : "YELLOW",
      detail: `${cssrsFlag.length} affirmative item(s) in past month`,
    });
  }

  // Active HI
  if (s.hiCurrent === "yes") {
    flags.push({
      id: "hi",
      label: "Active HI",
      light: "RED",
      detail: "Homicidal ideation reported — Tarasoff duty applies",
    });
  }

  // Recent self-harm
  if (s.selfHarmHx === "yes") {
    flags.push({
      id: "self-harm",
      label: "Self-harm",
      light: "YELLOW",
      detail: "History of self-harm reported",
    });
  }

  // Withdrawal risk
  if (s.withdrawalRisk === "severe") {
    flags.push({
      id: "withdrawal",
      label: "Withdrawal",
      light: "RED",
      detail: "Severe withdrawal risk — medically monitored detox",
    });
  } else if (s.withdrawalRisk === "moderate") {
    flags.push({
      id: "withdrawal",
      label: "Withdrawal",
      light: "YELLOW",
      detail: "Moderate withdrawal risk — monitored detox indicated",
    });
  }

  // Immediate medical
  if (s.immediateMedical === "yes") {
    flags.push({
      id: "medical",
      label: "Medical",
      light: "RED",
      detail: s.immediateMedicalDetail || "Immediate medical concern",
    });
  }

  // Violence hx
  if (s.violenceHx === "yes") {
    flags.push({
      id: "violence-hx",
      label: "Violence Hx",
      light: "YELLOW",
      detail: s.violenceDetail || "History of violent behavior reported",
    });
  }

  // GAD-7 ≥ 15
  const gad = totalScore(s.gad7, 7);
  if (gad >= 15) {
    flags.push({
      id: "gad-severe",
      label: "GAD-7 severe",
      light: "YELLOW",
      detail: `GAD-7 score ${gad}`,
    });
  }

  // PHQ-9 ≥ 15
  const phq = totalScore(s.phq9, 9);
  if (phq >= 15) {
    flags.push({
      id: "phq-modsev",
      label: "PHQ-9 ≥ moderately severe",
      light: phq >= 20 ? "RED" : "YELLOW",
      detail: `PHQ-9 score ${phq}`,
    });
  }

  // ASAM acuity
  const acuity = asamAcuityLight(s.asam);
  if (acuity !== "GREEN") {
    flags.push({
      id: "asam-acuity",
      label: "ASAM acuity",
      light: acuity,
      detail: `Highest dimension score ${Math.max(...Object.values(s.asam))} of 4`,
    });
  }

  return flags;
}

export function flagSummary(flags: SafetyFlag[]): Light {
  if (flags.some((f) => f.light === "RED")) return "RED";
  if (flags.some((f) => f.light === "YELLOW")) return "YELLOW";
  return "GREEN";
}

export function SafetyFlagsPanel({ state }: { state: PaaState }) {
  const flags = deriveFlags(state);
  if (flags.length === 0) {
    return (
      <Card variant="flat" className="border-[var(--success)]/30 bg-[var(--success)]/[0.04]">
        <div className="flex items-center gap-3 text-sm">
          <span className="size-2 rounded-full bg-[var(--success)]" />
          <span className="text-white">No safety flags raised</span>
          <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
            keep screening
          </span>
        </div>
      </Card>
    );
  }
  return (
    <Card variant="flat" className="border-[var(--warning)]/30">
      <div className="overline mb-2">Safety flags active</div>
      <ul className="space-y-1.5">
        {flags.map((f) => (
          <li
            key={f.id}
            className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2"
          >
            <Badge tone={f.light}>{f.label}</Badge>
            <span className="text-xs text-[var(--ink-2)]">{f.detail}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
