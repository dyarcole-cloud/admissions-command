import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
          Branding, payor import/export, team invites, retention policy display.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card variant="aurora">
          <Badge tone="violet">Tenant</Badge>
          <h3
            className="font-display mt-2 text-lg text-white"
            style={{ fontVariationSettings: "'opsz' 72" }}
          >
            Northbound Treatment Network
          </h3>
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            Demo tenant · seeded payors · brain video on
          </p>
        </Card>
        <Card variant="aurora">
          <Badge tone="warning">Week 3</Badge>
          <p className="mt-2 text-sm text-[var(--ink-2)]">
            Full settings panel ships with the auth + tenant model: team
            invites with Firebase custom claims, payor CSV/JSON import + export,
            DEID retention display.
          </p>
        </Card>
      </div>
    </div>
  );
}
