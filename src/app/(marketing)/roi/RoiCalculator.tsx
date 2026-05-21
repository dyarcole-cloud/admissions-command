"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_ROI_INPUTS,
  calcRoi,
  formatCurrency,
  type RoiInputs,
} from "@/lib/data/roi";
import { Card } from "@/components/ui/card";

type SliderRowProps = {
  label: string;
  field: keyof RoiInputs;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (n: number) => string;
  hint?: string;
  onChange: (field: keyof RoiInputs, value: number) => void;
};

function SliderRow({
  label,
  field,
  value,
  min,
  max,
  step,
  format,
  hint,
  onChange,
}: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={String(field)}
          className="text-xs uppercase tracking-[0.14em] text-[var(--ink-3)]"
        >
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums text-white">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={String(field)}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(field, Number(e.target.value))}
        className="w-full accent-[var(--violet)]"
      />
      {hint && <div className="text-[11px] text-[var(--ink-4)]">{hint}</div>}
    </div>
  );
}

export function RoiCalculator() {
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULT_ROI_INPUTS);
  const out = useMemo(() => calcRoi(inputs), [inputs]);

  const update = (field: keyof RoiInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <div className="overline mb-4">Inputs</div>
        <div className="space-y-5">
          <SliderRow
            label="Calls / month"
            field="callsPerMonth"
            value={inputs.callsPerMonth}
            min={50}
            max={1500}
            step={10}
            onChange={update}
          />
          <SliderRow
            label="Current conversion %"
            field="currentConversionPct"
            value={inputs.currentConversionPct}
            min={5}
            max={60}
            step={1}
            format={(n) => `${n}%`}
            onChange={update}
          />
          <SliderRow
            label="Average LOS (days)"
            field="avgLosDays"
            value={inputs.avgLosDays}
            min={7}
            max={90}
            step={1}
            onChange={update}
          />
          <SliderRow
            label="Average daily revenue"
            field="avgDailyRevenue"
            value={inputs.avgDailyRevenue}
            min={400}
            max={3000}
            step={50}
            format={(n) => formatCurrency(n)}
            onChange={update}
          />
          <SliderRow
            label="Bad-admit cost"
            field="badAdmitCost"
            value={inputs.badAdmitCost}
            min={2000}
            max={25000}
            step={500}
            format={(n) => formatCurrency(n)}
            onChange={update}
          />
          <SliderRow
            label="Bad-admit rate %"
            field="badAdmitPct"
            value={inputs.badAdmitPct}
            min={1}
            max={25}
            step={1}
            format={(n) => `${n}%`}
            onChange={update}
          />
          <SliderRow
            label="Missed-call rate %"
            field="missedCallPct"
            value={inputs.missedCallPct}
            min={5}
            max={50}
            step={1}
            format={(n) => `${n}%`}
            onChange={update}
          />
          <SliderRow
            label="Rep monthly cost"
            field="repMonthlyCost"
            value={inputs.repMonthlyCost}
            min={3000}
            max={15000}
            step={100}
            format={(n) => formatCurrency(n)}
            onChange={update}
          />
          <SliderRow
            label="Rep count"
            field="repCount"
            value={inputs.repCount}
            min={1}
            max={8}
            step={1}
            onChange={update}
          />
          <SliderRow
            label="Tool cost / month"
            field="toolMonthlyCost"
            value={inputs.toolMonthlyCost}
            min={500}
            max={10000}
            step={100}
            format={(n) => formatCurrency(n)}
            onChange={update}
          />
        </div>
      </Card>

      <Card variant="aurora">
        <div className="overline mb-2">Net uplift, per year</div>
        <div
          className="hero-gradient-text font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          {formatCurrency(out.netUpliftPerYear)}
        </div>
        <div className="mt-1 text-xs text-[var(--ink-3)]">
          {formatCurrency(out.netUpliftPerMonth)} / month · payback in{" "}
          {isFinite(out.paybackMonths) ? out.paybackMonths.toFixed(1) : "—"}{" "}
          months · {isFinite(out.roiMultiple) ? out.roiMultiple.toFixed(1) : "—"}×
          ROI
        </div>

        <div className="mt-8 space-y-3">
          {[
            {
              label: "Recovered missed calls",
              v: out.recoveredFromMissedCalls,
              tone: "var(--violet)",
            },
            {
              label: "Conversion lift",
              v: out.liftFromConversionImprovement,
              tone: "var(--periwinkle)",
            },
            {
              label: "Bad-admit costs avoided",
              v: out.badAdmitCostsAvoided,
              tone: "var(--copper-bright)",
            },
            { label: "Labor savings", v: out.laborSavings, tone: "var(--success)" },
          ].map((r) => (
            <div
              key={r.label}
              className="flex items-baseline justify-between border-b border-white/[0.05] py-2 last:border-0"
            >
              <span className="text-sm text-[var(--ink-2)]">{r.label}</span>
              <span
                className="font-mono text-sm tabular-nums"
                style={{ color: r.tone }}
              >
                {formatCurrency(r.v)}
                <span className="ml-1 text-[10px] text-[var(--ink-4)]">/mo</span>
              </span>
            </div>
          ))}
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-sm uppercase tracking-[0.14em] text-[var(--ink-3)]">
              Total monthly upside
            </span>
            <span className="font-mono text-lg tabular-nums text-white">
              {formatCurrency(out.totalUpsidePerMonth)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm uppercase tracking-[0.14em] text-[var(--ink-3)]">
              Tool cost
            </span>
            <span className="font-mono text-lg tabular-nums text-[var(--error-soft)]">
              −{formatCurrency(out.toolCostPerMonth)}
            </span>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-[var(--ink-3)]">
          Assumptions: missed-call recovery 30% of currently-lost calls,
          conversion lift 35% relative (cap 85% absolute), bad-admit rate halved,
          0.3 FTE of labor recaptured per rep. Tune them yourself in{" "}
          <span className="font-mono">src/lib/data/roi.ts</span>.
        </p>
      </Card>
    </div>
  );
}
