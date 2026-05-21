/**
 * ROI math model for the Admissions Command pitch.
 *
 * Defaults reflect a typical mid-size behavioral health facility
 * (40–60 beds, single campus, 2-rep admissions team). Every input
 * is tunable in the /roi page.
 */

export type RoiInputs = {
  /** Total inbound calls per month */
  callsPerMonth: number;
  /** Current conversion rate (% of calls → admits) */
  currentConversionPct: number;
  /** Average length of stay (days) for a placed admit */
  avgLosDays: number;
  /** Average daily revenue (USD) for a placed admit */
  avgDailyRevenue: number;
  /** Cost of one bad admit that gets discharged mid-treatment (USD) */
  badAdmitCost: number;
  /** Bad-admit rate today (% of admits that turn into a discharge) */
  badAdmitPct: number;
  /** Missed-call rate today (% of inbound that go unanswered or are lost mid-call) */
  missedCallPct: number;
  /** Admissions rep monthly fully-loaded cost (USD) */
  repMonthlyCost: number;
  /** Number of full-time admissions reps today */
  repCount: number;
  /** Monthly Admissions Command licensing cost (USD) */
  toolMonthlyCost: number;
};

export const DEFAULT_ROI_INPUTS: RoiInputs = {
  callsPerMonth: 280,
  currentConversionPct: 18,
  avgLosDays: 28,
  avgDailyRevenue: 1100,
  badAdmitCost: 8500,
  badAdmitPct: 8,
  missedCallPct: 22,
  repMonthlyCost: 6800,
  repCount: 2,
  toolMonthlyCost: 2500,
};

export type RoiOutputs = {
  baselineRevenue: number;
  recoveredFromMissedCalls: number;
  liftFromConversionImprovement: number;
  badAdmitCostsAvoided: number;
  laborSavings: number;
  totalUpsidePerMonth: number;
  toolCostPerMonth: number;
  netUpliftPerMonth: number;
  netUpliftPerYear: number;
  paybackMonths: number;
  roiMultiple: number;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export function calcRoi(i: RoiInputs): RoiOutputs {
  const placedToday = (i.callsPerMonth * i.currentConversionPct) / 100;
  const placedRev = placedToday * i.avgLosDays * i.avgDailyRevenue;

  // Missed-call recovery — assume the tool recovers 30% of currently lost calls,
  // converting them at the same rate as the rest of the pipeline.
  const missedCalls = (i.callsPerMonth * i.missedCallPct) / 100;
  const recoveredCalls = missedCalls * 0.3;
  const recoveredAdmits = (recoveredCalls * i.currentConversionPct) / 100;
  const recoveredFromMissedCalls =
    recoveredAdmits * i.avgLosDays * i.avgDailyRevenue;

  // Conversion lift — the tool raises conversion by 35% (relative) up to a 85% absolute ceiling.
  const liftedConversion = clamp(i.currentConversionPct * 1.35, 0, 85);
  const liftedAdmits = (i.callsPerMonth * liftedConversion) / 100;
  const liftFromConversionImprovement =
    (liftedAdmits - placedToday) * i.avgLosDays * i.avgDailyRevenue;

  // Bad-admit cost avoidance — tool halves the bad-admit rate.
  const badAdmitsToday = placedToday * (i.badAdmitPct / 100);
  const badAdmitsAvoided = badAdmitsToday * 0.5;
  const badAdmitCostsAvoided = badAdmitsAvoided * i.badAdmitCost;

  // Labor savings — tool reduces admissions rep effective load by 30%,
  // expressed in dollar terms (a 0.3 FTE that doesn't need to be backfilled).
  const laborSavings = i.repMonthlyCost * i.repCount * 0.3;

  const totalUpsidePerMonth =
    recoveredFromMissedCalls +
    liftFromConversionImprovement +
    badAdmitCostsAvoided +
    laborSavings;

  const netUpliftPerMonth = totalUpsidePerMonth - i.toolMonthlyCost;
  const netUpliftPerYear = netUpliftPerMonth * 12;

  const paybackMonths =
    netUpliftPerMonth > 0 ? i.toolMonthlyCost / netUpliftPerMonth : Infinity;
  const roiMultiple =
    i.toolMonthlyCost > 0 ? totalUpsidePerMonth / i.toolMonthlyCost : Infinity;

  return {
    baselineRevenue: placedRev,
    recoveredFromMissedCalls,
    liftFromConversionImprovement,
    badAdmitCostsAvoided,
    laborSavings,
    totalUpsidePerMonth,
    toolCostPerMonth: i.toolMonthlyCost,
    netUpliftPerMonth,
    netUpliftPerYear,
    paybackMonths,
    roiMultiple,
  };
}

export function formatCurrency(n: number): string {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
