"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PaaState } from "@/lib/data/paaSchema";

const STORAGE_KEY = "acmd:paa:draft:v1";

type Summary = {
  hasDraft: boolean;
  lastUpdated: number | null;
  sectionsTouched: number;
};

function summarize(): Summary {
  if (typeof window === "undefined")
    return { hasDraft: false, lastUpdated: null, sectionsTouched: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { hasDraft: false, lastUpdated: null, sectionsTouched: 0 };
    const d = JSON.parse(raw) as PaaState;
    const touched = [
      d.name || d.dob || d.address,
      d.presentingFactor || (d.symptoms && Object.values(d.symptoms).some(Boolean)),
      d.substancesNone || Object.keys(d.substances ?? {}).length > 0,
      Object.keys(d.phq9 ?? {}).length > 0 ||
        Object.keys(d.gad7 ?? {}).length > 0 ||
        Object.keys(d.cssrs ?? {}).length > 0,
      d.primaryDx || d.mhDx,
      d.asdScores?.some((n) => n > 0),
      d.psychHospCount || d.mhProgramsPrior || d.saProgramsPrior,
      d.medications || (d.conditions && Object.values(d.conditions).some(Boolean)),
      d.livingSituation || d.treatmentGoals,
      d.repNotes,
    ].filter(Boolean).length;
    if (touched === 0)
      return { hasDraft: false, lastUpdated: null, sectionsTouched: 0 };
    return {
      hasDraft: true,
      lastUpdated: d.lastUpdated ?? null,
      sectionsTouched: touched,
    };
  } catch {
    return { hasDraft: false, lastUpdated: null, sectionsTouched: 0 };
  }
}

export function PaaDraftBanner() {
  const [s, setS] = useState<Summary>({
    hasDraft: false,
    lastUpdated: null,
    sectionsTouched: 0,
  });

  useEffect(() => {
    setS(summarize());
    const onStorage = () => setS(summarize());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!s.hasDraft) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--periwinkle)]/30 bg-[var(--violet)]/[0.06] px-4 py-2.5 text-xs backdrop-blur">
      <span className="size-1.5 rounded-full bg-[var(--periwinkle)]" />
      <span className="text-[var(--ink-2)]">
        <span className="text-white">PAA draft in progress</span> ·{" "}
        {s.sectionsTouched} sections touched
        {s.lastUpdated && (
          <span className="font-mono text-[10px] tabular-nums text-[var(--ink-3)]">
            {" · "}last update {new Date(s.lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </span>
      <Link
        href="/app/preadmit"
        className="ml-auto rounded-full border border-[var(--periwinkle)]/40 bg-[var(--violet)]/[0.10] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--violet)]/[0.18]"
      >
        Continue Pre-Admit →
      </Link>
    </div>
  );
}
