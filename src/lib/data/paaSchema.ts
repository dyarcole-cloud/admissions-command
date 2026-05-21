/**
 * Pre-Admit Assessment (PAA) schema — typed shape for the 10-section
 * clinical intake. Field set is the v1 instrument streamlined: removed
 * COVID-era screening artifacts, consolidated yes/no + detail pairs,
 * replaced the categorical "Do Not Accept" gating with an escalation
 * route field.
 */

import type { AsamScores } from "./asam";
import { BLANK_ASAM_SCORES } from "./asam";
import type { ScreenerResponses } from "./screeners";

export type YesNoMaybe = "yes" | "no" | "unknown";
export type Severity = "none" | "mild" | "moderate" | "severe";

export type PaaState = {
  // 1. Demographics
  name: string;
  dob: string;
  age: string;
  sex: string;
  gender: string;
  address: string;
  occupation: string;
  preferredContact: "phone" | "email" | "text" | "";
  contactValue: string;

  // 2. Presenting Problem
  presentingFactor: string;
  symptoms: Record<string, boolean>;
  symptomsOther: string;
  traumaYN: YesNoMaybe;
  traumaDetail: string;

  // 3. Substance & Trauma
  substancesNone: boolean;
  substances: Record<
    string,
    {
      route?: string;
      frequency?: string;
      lastUse?: string;
      amount?: string;
    }
  >;
  otherDrugs: string;
  detoxHx: string;
  withdrawalRisk: Severity;

  // 4. Safety
  phq9: ScreenerResponses;
  gad7: ScreenerResponses;
  cssrs: ScreenerResponses;
  selfHarmHx: YesNoMaybe;
  selfHarmDetail: string;
  hiCurrent: YesNoMaybe;
  hiPast: YesNoMaybe;
  hiDetail: string;
  safetyPlan: string;

  // 5. Legal & Diagnoses
  legalIssues: string;
  probationOrParole: YesNoMaybe;
  violenceHx: YesNoMaybe;
  violenceDetail: string;
  mhDx: string;
  primaryDx: string;

  // 6. ASD/IDD
  asdScores: number[]; // 6 values, 0-3
  asdNote: string;
  iddPresent: YesNoMaybe;
  regionalCenter: YesNoMaybe;
  conservatorship: "none" | "self" | "lps" | "probate" | "unknown";
  conservatorContact: string;

  // 7. Treatment History
  psychHospCount: string;
  psychHospLast: string;
  mhProgramsPrior: string;
  saProgramsPrior: string;
  pastTxOutcomes: string;

  // 8. Medical History
  allergies: "nka" | "yes";
  allergyDetail: string;
  medications: string;
  medsBringing: string;
  heightWeight: string;
  conditions: Record<string, boolean>; // seizure, cardiac, renal, hepatic, diabetes, tbi, chronic-pain, eating-disorder
  conditionsDetail: string;
  mobilityNeeds: string;
  immediateMedical: YesNoMaybe;
  immediateMedicalDetail: string;

  // 9. Environment
  livingSituation: string;
  socialSupport: YesNoMaybe;
  socialSupportDetail: string;
  employed: YesNoMaybe;
  inSchool: YesNoMaybe;
  schoolDetail: string;
  treatmentGoals: string;

  // 10. Admin & Review
  clientType: "new" | "returning";
  comingFrom: string;
  paymentType: "insurance" | "self-pay" | "scholarship" | "other";
  repNotes: string;

  // ASAM (cross-cutting)
  asam: AsamScores;

  // Meta
  startedAt: number | null;
  lastUpdated: number;
  status: "draft" | "submitted";
  submittedAt: number | null;
  redactedSummary?: string;
  redactionCount?: number;
};

export function blankPaa(): PaaState {
  return {
    name: "",
    dob: "",
    age: "",
    sex: "",
    gender: "",
    address: "",
    occupation: "",
    preferredContact: "",
    contactValue: "",

    presentingFactor: "",
    symptoms: {},
    symptomsOther: "",
    traumaYN: "unknown",
    traumaDetail: "",

    substancesNone: false,
    substances: {},
    otherDrugs: "",
    detoxHx: "",
    withdrawalRisk: "none",

    phq9: {},
    gad7: {},
    cssrs: {},
    selfHarmHx: "no",
    selfHarmDetail: "",
    hiCurrent: "no",
    hiPast: "no",
    hiDetail: "",
    safetyPlan: "",

    legalIssues: "",
    probationOrParole: "no",
    violenceHx: "no",
    violenceDetail: "",
    mhDx: "",
    primaryDx: "",

    asdScores: [0, 0, 0, 0, 0, 0],
    asdNote: "",
    iddPresent: "no",
    regionalCenter: "no",
    conservatorship: "none",
    conservatorContact: "",

    psychHospCount: "",
    psychHospLast: "",
    mhProgramsPrior: "",
    saProgramsPrior: "",
    pastTxOutcomes: "",

    allergies: "nka",
    allergyDetail: "",
    medications: "",
    medsBringing: "",
    heightWeight: "",
    conditions: {},
    conditionsDetail: "",
    mobilityNeeds: "",
    immediateMedical: "no",
    immediateMedicalDetail: "",

    livingSituation: "",
    socialSupport: "yes",
    socialSupportDetail: "",
    employed: "no",
    inSchool: "no",
    schoolDetail: "",
    treatmentGoals: "",

    clientType: "new",
    comingFrom: "",
    paymentType: "insurance",
    repNotes: "",

    asam: BLANK_ASAM_SCORES,

    startedAt: Date.now(),
    lastUpdated: Date.now(),
    status: "draft",
    submittedAt: null,
  };
}

export const MEDICAL_CONDITIONS = [
  { id: "seizure", label: "Seizure disorder" },
  { id: "cardiac", label: "Cardiac" },
  { id: "renal", label: "Renal" },
  { id: "hepatic", label: "Hepatic" },
  { id: "diabetes", label: "Diabetes" },
  { id: "tbi", label: "TBI / head injury" },
  { id: "chronic-pain", label: "Chronic pain" },
  { id: "eating-disorder", label: "Eating disorder" },
  { id: "respiratory", label: "Respiratory" },
  { id: "pregnant", label: "Pregnant / postpartum" },
] as const;
