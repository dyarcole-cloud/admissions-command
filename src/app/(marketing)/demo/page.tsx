import type { Metadata } from "next";
import { DEMO_SCENARIOS } from "@/lib/data/demoScenarios";
import { DemoExplorer } from "./DemoExplorer";

export const metadata: Metadata = {
  title: "Live Demo",
  description:
    "Three real admissions scenarios — Green, Yellow, Red. See exactly how Admissions Command runs a call.",
};

export default function DemoPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-24 md:px-10 md:pt-20">
      <span className="accent-line mb-4 block" />
      <span className="overline">Live Demo</span>
      <h1
        className="font-display mt-3 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.022em] text-white"
        style={{ fontVariationSettings: "'opsz' 120" }}
      >
        Three calls.{" "}
        <span
          className="hero-gradient-text italic"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          Three outcomes.
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-base text-[var(--ink-2)]">
        See exactly how Admissions Command runs a real call — and where the
        revenue comes from. Green, Yellow, Red. Same product, three different
        plays.
      </p>

      <div className="mt-12">
        <DemoExplorer scenarios={DEMO_SCENARIOS} />
      </div>
    </section>
  );
}
