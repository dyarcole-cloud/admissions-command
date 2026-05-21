"use client";

export type ActiveCallSnapshot = {
  startedAt: number;
  segmentId: number;
  segmentName: string;
  payorPlan: string | null;
  payorLight: "GREEN" | "YELLOW" | "RED" | null;
};

const KEY = "acmd:active_call:v1";

export function readActiveCall(): ActiveCallSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveCallSnapshot;
  } catch {
    return null;
  }
}

export function writeActiveCall(snap: ActiveCallSnapshot): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(snap));
  } catch {}
}

export function clearActiveCall(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
