import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="overline">Analytics</span>
        <h1
          className="font-display mt-1 text-3xl text-white"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          Call performance
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-2)]">
          Live calls + completed calls. Filter by tier, payor, outcome, rep.
          Wires up in week 3 once tenant Firestore data flows in.
        </p>
      </div>

      <Card variant="aurora">
        <div className="flex items-start gap-3">
          <Badge tone="warning">Week 3</Badge>
          <p className="text-sm text-[var(--ink-2)]">
            Coming in the final week: call log with composite-indexed filters,
            tier breakdown, payor matrix, and an{" "}
            <span className="font-mono">advisor.summary</span> op for AI trend
            narration over the period.
          </p>
        </div>
      </Card>
    </div>
  );
}
