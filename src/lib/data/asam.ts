/**
 * ASAM Criteria — 6 dimensions, scored 0–4 each.
 * Used at intake to recommend an initial level of care.
 *
 * Reference: ASAM Criteria 4th edition (2023). Recommendation logic is
 * a simplified heuristic — final LOC is always a clinician's call.
 * The ASAM-at-intake pattern is borrowed from a sibling NBTN prototype.
 */

export type AsamDimensionId =
  | "intox"
  | "biomed"
  | "emotional"
  | "readiness"
  | "relapse"
  | "environment";

export type AsamDimension = {
  id: AsamDimensionId;
  num: 1 | 2 | 3 | 4 | 5 | 6;
  short: string;
  full: string;
  anchors: readonly string[]; // 5 anchors for scores 0..4
};

export const ASAM_DIMENSIONS: readonly AsamDimension[] = [
  {
    id: "intox",
    num: 1,
    short: "Intoxication / Withdrawal",
    full: "Acute Intoxication and/or Withdrawal Potential",
    anchors: [
      "0 — No risk; clean and oriented",
      "1 — Mild withdrawal possible, no medical risk",
      "2 — Moderate withdrawal expected, monitored detox needed",
      "3 — Severe withdrawal risk; medically monitored detox required",
      "4 — Acute medical emergency; ICU-level detox",
    ],
  },
  {
    id: "biomed",
    num: 2,
    short: "Biomedical",
    full: "Biomedical Conditions and Complications",
    anchors: [
      "0 — No biomedical issues",
      "1 — Stable chronic condition, no acute issues",
      "2 — Active chronic illness requiring management",
      "3 — Significant medical issues requiring close monitoring",
      "4 — Unstable medical condition requiring inpatient medical care",
    ],
  },
  {
    id: "emotional",
    num: 3,
    short: "Emotional / Behavioral",
    full: "Emotional, Behavioral, or Cognitive Conditions and Complications",
    anchors: [
      "0 — No mental health concerns",
      "1 — Mild MH symptoms, no functional impairment",
      "2 — Moderate symptoms affecting functioning",
      "3 — Severe symptoms; SI/HI without imminent plan; psychotic features",
      "4 — Acute psychiatric emergency; active plan; severe psychosis",
    ],
  },
  {
    id: "readiness",
    num: 4,
    short: "Readiness to Change",
    full: "Readiness to Change",
    anchors: [
      "0 — Strong commitment, internally motivated",
      "1 — Engaged but ambivalent in places",
      "2 — Ambivalent; needs MI engagement",
      "3 — Low motivation; coerced or pre-contemplative",
      "4 — Actively resistant or unable to engage",
    ],
  },
  {
    id: "relapse",
    num: 5,
    short: "Relapse / Continued Use",
    full: "Relapse, Continued Use, or Continued Problem Potential",
    anchors: [
      "0 — Stable recovery, strong coping",
      "1 — Mild risk; manageable with outpatient supports",
      "2 — Moderate risk; recent slips or failed outpatient",
      "3 — High risk; recent multiple relapses, poor insight",
      "4 — Imminent relapse risk; cannot maintain abstinence in environment",
    ],
  },
  {
    id: "environment",
    num: 6,
    short: "Recovery Environment",
    full: "Recovery / Living Environment",
    anchors: [
      "0 — Supportive, recovery-conducive environment",
      "1 — Mostly supportive with manageable stressors",
      "2 — Mixed environment; some active triggers",
      "3 — Unsupportive, active substance use or chaos in home",
      "4 — Dangerous or homeless; no safe place to discharge",
    ],
  },
];

export type AsamScores = Record<AsamDimensionId, number>;

export const BLANK_ASAM_SCORES: AsamScores = {
  intox: 0,
  biomed: 0,
  emotional: 0,
  readiness: 0,
  relapse: 0,
  environment: 0,
};

export type Loc =
  | "1.0" // Outpatient
  | "2.1" // IOP
  | "2.5" // PHP
  | "3.1" // Clinically managed low-intensity residential
  | "3.3" // Clinically managed population-specific high-intensity residential
  | "3.5" // Clinically managed medium-intensity residential
  | "3.7" // Medically monitored residential / inpatient
  | "4.0"; // Medically managed intensive inpatient

export type LocRec = {
  level: Loc;
  label: string;
  setting: string;
};

const LOC_TABLE: Record<Loc, LocRec> = {
  "1.0": { level: "1.0", label: "Outpatient", setting: "Office-based, < 9 hrs/wk" },
  "2.1": { level: "2.1", label: "IOP", setting: "9–19 hrs/wk, structured" },
  "2.5": { level: "2.5", label: "PHP / Day Treatment", setting: "20+ hrs/wk, no overnight" },
  "3.1": { level: "3.1", label: "Residential — low intensity", setting: "24-hr clinically managed" },
  "3.3": { level: "3.3", label: "Residential — population-specific", setting: "High-intensity, clinically managed" },
  "3.5": { level: "3.5", label: "Residential — medium intensity", setting: "Clinically managed, structured" },
  "3.7": { level: "3.7", label: "Medically monitored residential", setting: "24-hr nursing, MD on call" },
  "4.0": { level: "4.0", label: "Medically managed inpatient", setting: "Hospital, 24-hr MD" },
};

/**
 * Heuristic LOC recommendation from dimensional scores.
 *
 *  - Dim 1 (intox) = 4 → 4.0
 *  - Dim 1 = 3 OR Dim 2 = 4 → 3.7
 *  - Any dim ≥ 3 OR Dim 3 (emotional) ≥ 3 → 3.5
 *  - Two or more dims ≥ 2 → 3.1
 *  - Max dim = 2 → 2.5
 *  - Max dim = 1 with environment risk → 2.1
 *  - Otherwise → 1.0
 *
 * Always render as "suggested" — never as final clinical determination.
 */
export function recommendLoc(s: AsamScores): LocRec {
  if (s.intox >= 4) return LOC_TABLE["4.0"];
  if (s.intox >= 3 || s.biomed >= 4) return LOC_TABLE["3.7"];
  if (s.emotional >= 4) return LOC_TABLE["3.7"];
  const dims = Object.values(s);
  const max = Math.max(...dims);
  const overTwo = dims.filter((d) => d >= 2).length;
  if (max >= 3) return LOC_TABLE["3.5"];
  if (overTwo >= 2) return LOC_TABLE["3.1"];
  if (max === 2) return LOC_TABLE["2.5"];
  if (s.environment >= 1) return LOC_TABLE["2.1"];
  return LOC_TABLE["1.0"];
}

export function asamAcuityLight(s: AsamScores): "GREEN" | "YELLOW" | "RED" {
  const dims = Object.values(s);
  const max = Math.max(...dims);
  if (max >= 3) return "RED";
  if (max >= 2) return "YELLOW";
  return "GREEN";
}
