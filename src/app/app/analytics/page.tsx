import type { Metadata } from "next";
import { AnalyticsClient } from "./AnalyticsClient";

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
          Calls logged from the cockpit. Stored locally on your device until
          tenant Firestore syncing is enabled. Outcome breakdown, tier mix,
          top payors by volume, RED-flag tally.
        </p>
      </div>

      <AnalyticsClient />
    </div>
  );
}
