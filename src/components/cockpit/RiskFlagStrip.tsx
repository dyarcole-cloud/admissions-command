"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { asamAcuityLight, type AsamScores } from "@/lib/data/asam";
import { CRISIS_PROTOCOLS, type CrisisId } from "@/lib/data/crisisProtocols";
import type { Light } from "@/lib/utils";
import type { Payor } from "@/lib/data/payors";

type Props = {
  scores: AsamScores;
  payor: Payor | null;
  crisisOpen: boolean;
  onOpenCrisis: (id?: CrisisId) => void;
};

function detoxLight(s: AsamScores): Light {
  if (s.intox >= 3) return "RED";
  if (s.intox >= 2) return "YELLOW";
  return "GREEN";
}

function safetyLight(s: AsamScores): Light {
  if (s.emotional >= 3) return "RED";
  if (s.emotional >= 2) return "YELLOW";
  return "GREEN";
}

function biomedLight(s: AsamScores): Light {
  if (s.biomed >= 3) return "RED";
  if (s.biomed >= 2) return "YELLOW";
  return "GREEN";
}

function envLight(s: AsamScores): Light {
  if (s.environment >= 3) return "RED";
  if (s.environment >= 2) return "YELLOW";
  return "GREEN";
}

export function RiskFlagStrip({
  scores,
  payor,
  crisisOpen,
  onOpenCrisis,
}: Props) {
  const acuity = asamAcuityLight(scores);
  const safety = safetyLight(scores);
  const detox = detoxLight(scores);
  const biomed = biomedLight(scores);
  const env = envLight(scores);

  const anyRed =
    acuity === "RED" ||
    safety === "RED" ||
    detox === "RED" ||
    biomed === "RED" ||
    env === "RED";

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl border px-3 py-2.5 backdrop-blur transition-shadow"
      style={{
        background: anyRed
          ? "rgba(239,68,68,0.06)"
          : "rgba(255,255,255,0.02)",
        borderColor: anyRed
          ? "rgba(239,68,68,0.3)"
          : "rgba(255,255,255,0.08)",
        boxShadow: anyRed
          ? "0 0 24px rgba(239,68,68,0.18)"
          : undefined,
      }}
    >
      <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--ink-3)]">
        Flags
      </span>

      <FlagChip label="Acuity" light={acuity} />
      <FlagChip label="Safety" light={safety} />
      <FlagChip label="Detox" light={detox} />
      <FlagChip label="Biomedical" light={biomed} />
      <FlagChip label="Environment" light={env} />
      {payor && <FlagChip label="Payor" light={payor.light} />}

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] md:inline">
          Quick crisis:
        </span>
        {CRISIS_PROTOCOLS.slice(0, 3).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpenCrisis(p.id)}
            className="rounded-full border border-[var(--error)]/30 bg-[var(--error)]/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-[var(--error-soft)] transition hover:bg-[var(--error)]/[0.14]"
          >
            {p.short}
          </button>
        ))}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onOpenCrisis()}
          disabled={crisisOpen}
        >
          {crisisOpen ? "Crisis active" : "Open crisis mode"}
        </Button>
      </div>
    </div>
  );
}

function FlagChip({ label, light }: { label: string; light: Light }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)]">
        {label}
      </span>
      <Badge tone={light}>{light}</Badge>
    </span>
  );
}
