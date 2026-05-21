import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PAA_SECTIONS } from "@/lib/data/paa";

export const metadata: Metadata = { title: "Pre-Admit Assessment" };

export default function PreAdmitPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="overline">Pre-Admit · 10-section clinical intake</span>
        <h1
          className="font-display mt-1 text-3xl text-white"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          Assessment
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-2)]">
          Full instrument from v1 ports here in week 2 with{" "}
          <span className="text-white">DEID-on-submit</span> via AWS Comprehend
          Medical and clinician-routed escalation. The categorical &quot;Do Not
          Accept&quot; gating is replaced with a Clinical Director / Medical
          Director routing field.
        </p>
      </div>

      <Card variant="flat">
        <div className="overline mb-3">Sections</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {PAA_SECTIONS.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--violet)]/15 font-mono text-xs text-[var(--violet)]">
                {s.glyph}
              </span>
              <span className="text-sm text-[var(--ink-2)]">{s.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="aurora">
        <div className="flex items-start gap-3">
          <Badge tone="warning">Week 2</Badge>
          <p className="text-sm text-[var(--ink-2)]">
            Coming in the next build phase: full PAA capture, ASD score
            calculator (replacing categorical exclusion language), safety-flag
            aggregation, DEID Lambda pipeline → SES with sha256 audit trail.
          </p>
        </div>
      </Card>
    </div>
  );
}
