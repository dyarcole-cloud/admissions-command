import type { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="overline">Settings</span>
        <h1
          className="font-display mt-1 text-3xl text-white"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          Organization
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-2)]">
          Branding, escalation routes (Clinical Director / Medical Director /
          Executive), and payor CSV/JSON importer. All stored locally until
          tenant Firestore syncing flips on.
        </p>
      </div>
      <SettingsClient />
    </div>
  );
}
