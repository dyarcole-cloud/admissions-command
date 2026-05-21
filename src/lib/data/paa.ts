export type PaaSection = {
  id: string;
  label: string;
  glyph: string;
};

export const PAA_SECTIONS: PaaSection[] = [
  { id: "demo", label: "Demographics", glyph: "1" },
  { id: "presenting", label: "Presenting Problem", glyph: "2" },
  { id: "substance", label: "Substance & Trauma", glyph: "3" },
  { id: "safety", label: "Safety Screening", glyph: "4" },
  { id: "legal", label: "Legal & Diagnoses", glyph: "5" },
  { id: "asd", label: "ASD/IDD Screen", glyph: "6" },
  { id: "txhx", label: "Treatment History", glyph: "7" },
  { id: "medical", label: "Medical History", glyph: "8" },
  { id: "environment", label: "Environment", glyph: "9" },
  { id: "admin", label: "Admin & Review", glyph: "✓" },
];

export const PAA_SYMPTOMS = [
  "Sadness/tearfulness",
  "Irritability/agitation",
  "Changes in sleep",
  "Changes in appetite",
  "Loss of interest in activities",
  "Feelings of hopelessness",
  "Feelings of helplessness",
  "Feelings of anxiety/panic/fears",
  "Flashbacks",
  "Avoidance/withdrawal",
  "Relationship problems",
  "Hallucinations/delusions",
  "Trauma (past or current)",
] as const;

export const PAA_SUBSTANCES = [
  "Alcohol",
  "Amphetamines",
  "Cocaine",
  "Crack",
  "Heroin",
  "Oxys/Roxys",
  "Percocets",
  "Xanax",
  "Klonopin",
  "Marijuana",
] as const;

export const PAA_ASD_QS = [
  "Do you prefer being alone or with people? How do you feel in groups?",
  "Is it difficult to understand others' intentions or feelings?",
  "Do you have strict daily routines or rituals?",
  "How do you react to sudden changes in plans?",
  "Are you easily overwhelmed by sounds, lights, smells, or textures?",
  "Do you have strong preferences or dislikes for certain sensory input?",
] as const;

export type AsdRisk = "GREEN" | "YELLOW" | "RED";

/** ASD risk scoring — total of 6 scores (each 0–3) → 0–18 range.
 *  Replaces the categorical "Do Not Accept" gating from v1 with an escalation route. */
export function asdRiskFromScores(scores: number[]): AsdRisk {
  const total = scores.reduce((a, b) => a + b, 0);
  if (total <= 4) return "GREEN";
  if (total <= 7) return "YELLOW";
  return "RED";
}

/** Single source of truth for clinical escalation language —
 *  NEVER use "Do Not Accept" or categorical exclusion verbiage in UI. */
export function escalationLabel(risk: AsdRisk): string {
  switch (risk) {
    case "GREEN":
      return "Standard intake";
    case "YELLOW":
      return "Escalate to Clinical Director";
    case "RED":
      return "Escalate to Clinical Director + Medical Director";
  }
}
