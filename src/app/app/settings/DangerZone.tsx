"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const KEYS = [
  "acmd:paa:draft:v1",
  "acmd:call_log:v1",
  "acmd:org:v1",
  "acmd:ai:v1",
  "acmd:audit_log:v1",
  "acmd:locale:v1",
  "acmd:payor:recent:v1",
  "acmd:payor:fav:v1",
  "acmd:active_call:v1",
  "acmd:scratchpad:v1",
  "acmd:onboarding:dismissed:v1",
  "acmd:pwa:dismissed",
];

export function DangerZone() {
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);

  const purge = () => {
    KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
    setDone(true);
    setConfirmed(false);
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <Card variant="flat" className="border-[var(--error)]/20">
      <div className="overline mb-2 text-[var(--error-soft)]">Danger zone</div>
      <p className="text-xs text-[var(--ink-3)]">
        Resets every local store on this device — assessments draft, call log,
        audit log, AI key, recent payors, favorites, scratchpad, locale,
        onboarding flag. Cannot be undone. Use only when you want a clean slate
        for a demo.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => (confirmed ? purge() : setConfirmed(true))}
        >
          {done
            ? "Cleared · reloading…"
            : confirmed
              ? "Tap again to confirm"
              : "Reset all local data"}
        </Button>
        {confirmed && !done && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmed(false)}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
