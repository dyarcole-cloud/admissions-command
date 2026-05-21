import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Build vs Buy",
  description:
    "What you would build in-house vs what ships with Admissions Command. The math of an internal build, year one.",
};

type Row = {
  capability: string;
  diy: string;
  ac: string;
  diyCost: string;
  acCost: string;
};

const ROWS: Row[] = [
  {
    capability: "Payor playbook + claims tiering",
    diy: "6-month consultant engagement + 1 analyst FTE",
    ac: "Ships day 1, importable from CSV/JSON",
    diyCost: "$95K",
    acCost: "included",
  },
  {
    capability: "Live-call script + objection library",
    diy: "Internal clinical/sales authoring · ~3 months",
    ac: "5-phase script + objection library, clinician-reviewed",
    diyCost: "$28K",
    acCost: "included",
  },
  {
    capability: "Pre-Admit clinical assessment",
    diy: "Clinician-authored 10-section instrument + dev",
    ac: "Built on ASD/IDD-aware screen, safety-flag aggregation",
    diyCost: "$45K",
    acCost: "included",
  },
  {
    capability: "DEID-on-submit (PHI redaction)",
    diy: "AWS Comprehend Medical wiring + audit pipeline",
    ac: "Lambda + Comprehend + SES + sha256 audit trail",
    diyCost: "$22K",
    acCost: "included",
  },
  {
    capability: "AI coaching (live, payor-aware)",
    diy: "Anthropic API wrapper + prompt engineering",
    ac: "Bedrock-backed advisor with segment + payor context",
    diyCost: "$18K",
    acCost: "included",
  },
  {
    capability: "Multi-tenant auth + isolation",
    diy: "Firebase Auth + custom claims + rules + onboarding",
    ac: "Built-in, per-tenant Firestore + audit log",
    diyCost: "$24K",
    acCost: "included",
  },
  {
    capability: "Mobile-ready PWA",
    diy: "Add-to-home, splash, offline, iOS quirks",
    ac: "Manifest + apple-icon + shortcuts ship",
    diyCost: "$9K",
    acCost: "included",
  },
  {
    capability: "Ongoing maintenance (year 1)",
    diy: "0.5 FTE eng + Anthropic/AWS cost",
    ac: "Bundled in subscription",
    diyCost: "$72K",
    acCost: "included",
  },
];

const TOTAL_DIY = "$313K";
const TOTAL_AC = "$30K";

export default function VsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-24 md:px-10 md:pt-20">
      <span className="accent-line mb-4 block" />
      <span className="overline">Build vs Buy</span>
      <h1
        className="font-display mt-3 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.022em] text-white"
        style={{ fontVariationSettings: "'opsz' 120" }}
      >
        You could build this.{" "}
        <span
          className="hero-gradient-text italic"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          We already did.
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-base text-[var(--ink-2)]">
        Year-one math for a mid-size facility. Estimates assume one product
        manager and one engineer building this in-house over a 9-month window —
        which is the only honest comparison.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card variant="aurora">
          <div className="overline mb-2">DIY · year one</div>
          <div
            className="font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-none text-white"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            {TOTAL_DIY}
          </div>
          <div className="mt-1 text-xs text-[var(--ink-3)]">
            engineering + clinical + ops, with no guarantee it ships on time
          </div>
        </Card>
        <Card variant="aurora">
          <div className="overline mb-2">Admissions Command · year one</div>
          <div
            className="hero-gradient-text font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-none"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            {TOTAL_AC}
          </div>
          <div className="mt-1 text-xs text-[var(--ink-3)]">
            subscription, ships in week one, clinician-reviewed
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-x-auto" variant="flat">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Capability
              </th>
              <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Build it
              </th>
              <th className="px-3 py-3 text-right text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                DIY cost
              </th>
              <th className="px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Buy it
              </th>
              <th className="px-3 py-3 text-right text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                AC
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr
                key={r.capability}
                className="border-b border-white/[0.04] last:border-0"
              >
                <td className="px-3 py-3 align-top text-white">
                  {r.capability}
                </td>
                <td className="px-3 py-3 align-top text-[var(--ink-2)]">
                  {r.diy}
                </td>
                <td className="px-3 py-3 text-right align-top font-mono tabular-nums text-[var(--error-soft)]">
                  {r.diyCost}
                </td>
                <td className="px-3 py-3 align-top text-[var(--ink-2)]">
                  {r.ac}
                </td>
                <td className="px-3 py-3 text-right align-top">
                  <Badge tone="success">{r.acCost}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="mt-6 text-xs text-[var(--ink-3)]">
        Estimates are directional. Every facility has different blended labor
        rates — but the order of magnitude rarely moves.
      </p>
    </section>
  );
}
