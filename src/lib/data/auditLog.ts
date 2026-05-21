"use client";

import type { Light } from "@/lib/utils";

export type AuditEntry = {
  id: string;
  assessmentId: string;
  submittedAt: number;
  redactionCount: number;
  phiHashes: string[];
  asamMaxDim: number;
  acuity: Light;
  flagCount: number;
  loc: string;
  source: "mock" | "lambda" | "byok" | "unknown";
};

const KEY = "acmd:audit_log:v1";
const MAX = 300;

export function readAuditLog(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendAuditEntry(entry: AuditEntry): AuditEntry[] {
  const log = readAuditLog();
  log.unshift(entry);
  const trimmed = log.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {}
  return trimmed;
}

export function clearAuditLog(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
