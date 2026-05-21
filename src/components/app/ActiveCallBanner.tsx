"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readActiveCall, type ActiveCallSnapshot } from "@/lib/data/activeCall";

function formatElapsed(startedAt: number): string {
  const sec = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function ActiveCallBanner() {
  const [snap, setSnap] = useState<ActiveCallSnapshot | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    setSnap(readActiveCall());
    const tick = setInterval(() => force((x) => x + 1), 1000);
    const onStorage = () => setSnap(readActiveCall());
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(tick);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!snap) return null;

  const lightColor =
    snap.payorLight === "GREEN"
      ? "var(--success)"
      : snap.payorLight === "YELLOW"
        ? "var(--warning)"
        : snap.payorLight === "RED"
          ? "var(--error-soft)"
          : "var(--periwinkle)";

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-2.5 text-xs backdrop-blur"
      style={{
        borderColor: `${lightColor}55`,
        background: `${lightColor}10`,
      }}
    >
      <span
        className="size-2 animate-pulse rounded-full"
        style={{ background: lightColor }}
      />
      <span className="text-[var(--ink-2)]">
        <span className="text-white">Live call active</span> · {snap.segmentName} ·{" "}
        <span className="font-mono tabular-nums text-white">
          {formatElapsed(snap.startedAt)}
        </span>
        {snap.payorPlan && (
          <span className="text-[var(--ink-3)]"> · {snap.payorPlan}</span>
        )}
      </span>
      <Link
        href="/app"
        className="ml-auto rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
      >
        Back to cockpit →
      </Link>
    </div>
  );
}
