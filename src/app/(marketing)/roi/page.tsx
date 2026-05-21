import type { Metadata } from "next";
import { RoiCalculator } from "./RoiCalculator";

export const metadata: Metadata = {
  title: "ROI",
  description:
    "Tunable ROI model — see the dollar impact of Admissions Command for your facility. Conversion lift, missed-call recovery, bad-admit avoidance, labor savings.",
};

export default function RoiPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-24 md:px-10 md:pt-20">
      <span className="accent-line mb-4 block" />
      <span className="overline">Return on Investment</span>
      <h1
        className="font-display mt-3 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.022em] text-white"
        style={{ fontVariationSettings: "'opsz' 120" }}
      >
        The math, in{" "}
        <span
          className="hero-gradient-text italic"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          your numbers.
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-base text-[var(--ink-2)]">
        Tune every input. The model reflects four operational levers: recovered
        missed calls, conversion lift, bad-admit avoidance, and labor savings.
        No vanity multipliers — the formulas are visible.
      </p>

      <div className="mt-12">
        <RoiCalculator />
      </div>
    </section>
  );
}
