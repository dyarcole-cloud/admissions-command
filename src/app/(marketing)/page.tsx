import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayorPreview } from "@/components/marketing/PayorPreview";

const STATS = [
  { k: "5-phase", v: "live-call script" },
  { k: "10-section", v: "clinical assessment" },
  { k: "Tier-aware", v: "payor playbook" },
] as const;

const FEATURES = [
  {
    title: "Live-call cockpit",
    desc: "5-phase script, objection library, segment timer, AI coaching that knows the payor and the moment in the call.",
    accent: "var(--violet)",
  },
  {
    title: "Pre-Admit assessment",
    desc: "10-section MH/SUD intake with ASD screen, safety-flag aggregation, DEID-on-submit and clinician-routed escalation.",
    accent: "var(--copper-bright)",
  },
  {
    title: "Payor playbook",
    desc: "Light-tiered claims strategy with phase-by-phase appeal guidance. Import your payors, search by light or employer.",
    accent: "var(--periwinkle)",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-24 text-center md:pt-28 md:pb-32">
        <span className="accent-line mb-6" />
        <span className="overline mb-5">
          Northbound Treatment Network · Admissions Operating System
        </span>
        <h1
          className="font-display max-w-4xl text-[clamp(2.4rem,6.5vw,5rem)] font-normal leading-[1.02] tracking-[-0.025em] text-white"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          Every admissions call,{" "}
          <span
            className="hero-gradient-text italic"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            commanded.
          </span>
        </h1>
        <p
          className="font-display mt-6 max-w-2xl text-[clamp(1.1rem,2vw,1.4rem)] italic text-[var(--ink-2)]"
          style={{ fontVariationSettings: "'opsz' 72" }}
        >
          Insurance intel, clinical assessment, payor playbook, and AI coaching —
          one cockpit, built for the way intake actually runs.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/app">
            <Button>Launch cockpit →</Button>
          </Link>
          <Link href="/demo">
            <Button variant="ghost">Watch a live call</Button>
          </Link>
        </div>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map((s) => (
            <Card key={s.k} variant="aurora" className="text-left">
              <div
                className="font-display text-2xl text-white"
                style={{ fontVariationSettings: "'opsz' 96" }}
              >
                {s.k}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-3)]">
                {s.v}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="accent-line mb-4 block" />
            <span className="overline">Live data</span>
            <h2
              className="font-display mt-3 text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.05] tracking-[-0.022em] text-white"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              864 payors. <span className="hero-gradient-text italic" style={{ fontVariationSettings: "'opsz' 72" }}>Tiered, primed, ready.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm text-[var(--ink-2)]">
              Every commercial carrier, every state Medicaid line, every union
              trust and federal carve-out — light-tiered, admit rule on each
              plan, claims playbook attached. Search lives here against the
              same dataset the cockpit uses.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--ink-2)]">
              {[
                "Traffic-light tier per plan (GREEN admit · YELLOW review · RED route)",
                "Phase-by-phase claims appeal strategy with success rates",
                "Card-clue + ID prefix lookup so reps recognize the plan before they spell it",
                "Tenant-importable — drop your own payor sheet, merges into the master",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[var(--periwinkle)]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <PayorPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} variant="aurora">
              <div
                className="mb-3 inline-block h-1 w-12 rounded-full"
                style={{
                  background: f.accent,
                  boxShadow: `0 0 16px ${f.accent}`,
                }}
              />
              <h3
                className="font-display text-xl text-white"
                style={{ fontVariationSettings: "'opsz' 72" }}
              >
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">
                {f.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
