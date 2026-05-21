"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  clearAuditLog,
  readAuditLog,
  type AuditEntry,
} from "@/lib/data/auditLog";

export function AuditLogViewer() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    setEntries(readAuditLog());
  }, []);

  const clear = () => {
    if (!confirm("Clear all audit entries from this device?")) return;
    clearAuditLog();
    setEntries([]);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admissions-command-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card variant="aurora" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="overline">Audit log</div>
          <p className="mt-0.5 text-[11px] text-[var(--ink-3)]">
            Every PAA submission. Raw PHI never stored — only sha256 hashes
            for proof-of-redaction. Migrates to Firestore on tenant sync.
          </p>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-[var(--ink-4)]">
          {entries.length} entries
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.10] bg-white/[0.01] px-3 py-6 text-center text-xs text-[var(--ink-3)]">
          No submissions yet. Submit an assessment from /app/preadmit to see
          entries here.
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[var(--bg-deep)]/95 backdrop-blur">
              <tr>
                <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  When
                </th>
                <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Assessment ID
                </th>
                <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  LOC
                </th>
                <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Acuity
                </th>
                <th className="px-2 py-2 text-right text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Flags
                </th>
                <th className="px-2 py-2 text-right text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Redactions
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-white/[0.04]">
                  <td className="px-2 py-2 align-top font-mono text-[11px] tabular-nums text-[var(--ink-3)]">
                    {new Date(e.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-2 py-2 align-top font-mono text-[11px] tabular-nums text-[var(--ink-2)]">
                    {e.assessmentId.slice(0, 8)}…
                  </td>
                  <td className="px-2 py-2 align-top">
                    <Badge tone="violet">ASAM {e.loc}</Badge>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <Badge tone={e.acuity}>{e.acuity}</Badge>
                  </td>
                  <td className="px-2 py-2 text-right align-top font-mono tabular-nums text-[var(--ink-2)]">
                    {e.flagCount}
                  </td>
                  <td className="px-2 py-2 text-right align-top font-mono tabular-nums text-white">
                    {e.redactionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={exportJson}
          disabled={entries.length === 0}
        >
          Export JSON
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={clear}
          disabled={entries.length === 0}
        >
          Clear local log
        </Button>
      </div>
    </Card>
  );
}
