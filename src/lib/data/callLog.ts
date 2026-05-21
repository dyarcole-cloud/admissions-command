"use client";

/**
 * Local call log — captured to localStorage in v0. Migrates to per-tenant
 * Firestore (tenants/{tid}/call_log/{callId}) once auth + tenancy land.
 */

import type { Light } from "@/lib/utils";

export type CallLogEntry = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSec: number;
  segmentsReached: number;
  payorPlan: string | null;
  payorParent: string | null;
  payorLight: Light | null;
  asamMax: number;
  acuity: Light;
  outcome: CallOutcome;
  flagsRed: number;
  flagsYellow: number;
  rep: string | null;
};

export type CallOutcome =
  | "placed"
  | "referred"
  | "scheduled-followup"
  | "lost"
  | "in-progress";

const KEY = "acmd:call_log:v1";
const MAX = 500;

export function readLog(): CallLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CallLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendLog(entry: CallLogEntry): CallLogEntry[] {
  const log = readLog();
  log.unshift(entry);
  const trimmed = log.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {}
  return trimmed;
}

export function clearLog(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export type CallLogSummary = {
  total: number;
  durationAvgSec: number;
  byOutcome: Record<CallOutcome, number>;
  byLight: Record<Light, number>;
  topPayors: Array<{ name: string; count: number }>;
  redFlags: number;
};

export function summarize(log: CallLogEntry[]): CallLogSummary {
  const byOutcome: Record<CallOutcome, number> = {
    placed: 0,
    referred: 0,
    "scheduled-followup": 0,
    lost: 0,
    "in-progress": 0,
  };
  const byLight: Record<Light, number> = { GREEN: 0, YELLOW: 0, RED: 0 };
  const payorMap = new Map<string, number>();
  let totalDuration = 0;
  let redFlags = 0;

  for (const e of log) {
    byOutcome[e.outcome] += 1;
    if (e.payorLight) byLight[e.payorLight] += 1;
    if (e.payorPlan) {
      payorMap.set(e.payorPlan, (payorMap.get(e.payorPlan) ?? 0) + 1);
    }
    totalDuration += e.durationSec;
    redFlags += e.flagsRed;
  }

  const topPayors = [...payorMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    total: log.length,
    durationAvgSec: log.length > 0 ? Math.round(totalDuration / log.length) : 0,
    byOutcome,
    byLight,
    topPayors,
    redFlags,
  };
}
