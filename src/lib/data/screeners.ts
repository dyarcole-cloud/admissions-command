/**
 * Brief clinical screeners — PHQ-9, GAD-7, C-SSRS lite.
 *
 * These are public-domain validated instruments. We capture them at
 * intake to set silent baselines and surface safety flags. Scores
 * always render with the "informational, not diagnostic" qualifier.
 */

export type ScreenerOption = {
  label: string;
  value: number;
};

export type ScreenerItem = {
  prompt: string;
  options: readonly ScreenerOption[];
};

export type ScreenerBand = {
  min: number;
  max: number;
  label: string;
  severity: "none" | "mild" | "moderate" | "modSevere" | "severe";
};

export type Screener = {
  id: "phq9" | "gad7" | "cssrs";
  name: string;
  short: string;
  description: string;
  items: readonly ScreenerItem[];
  bands?: readonly ScreenerBand[];
  /** If any item answer ≥ this number, surface as a safety flag */
  flagThreshold?: number;
};

const FREQ_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
] as const;

export const PHQ9: Screener = {
  id: "phq9",
  name: "Patient Health Questionnaire-9",
  short: "PHQ-9",
  description:
    "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  items: [
    { prompt: "Little interest or pleasure in doing things", options: FREQ_OPTIONS },
    { prompt: "Feeling down, depressed, or hopeless", options: FREQ_OPTIONS },
    {
      prompt: "Trouble falling or staying asleep, or sleeping too much",
      options: FREQ_OPTIONS,
    },
    { prompt: "Feeling tired or having little energy", options: FREQ_OPTIONS },
    { prompt: "Poor appetite or overeating", options: FREQ_OPTIONS },
    {
      prompt:
        "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      options: FREQ_OPTIONS,
    },
    {
      prompt:
        "Trouble concentrating on things, such as reading or watching television",
      options: FREQ_OPTIONS,
    },
    {
      prompt:
        "Moving or speaking so slowly that other people could have noticed; or the opposite — being fidgety or restless",
      options: FREQ_OPTIONS,
    },
    {
      prompt:
        "Thoughts that you would be better off dead, or of hurting yourself in some way",
      options: FREQ_OPTIONS,
    },
  ],
  bands: [
    { min: 0, max: 4, label: "Minimal", severity: "none" },
    { min: 5, max: 9, label: "Mild", severity: "mild" },
    { min: 10, max: 14, label: "Moderate", severity: "moderate" },
    { min: 15, max: 19, label: "Moderately severe", severity: "modSevere" },
    { min: 20, max: 27, label: "Severe", severity: "severe" },
  ],
  flagThreshold: 1, // item 9 (suicidality) ≥ 1 = flag
};

export const GAD7: Screener = {
  id: "gad7",
  name: "Generalized Anxiety Disorder-7",
  short: "GAD-7",
  description:
    "Over the last 2 weeks, how often have you been bothered by the following problems?",
  items: [
    { prompt: "Feeling nervous, anxious, or on edge", options: FREQ_OPTIONS },
    { prompt: "Not being able to stop or control worrying", options: FREQ_OPTIONS },
    {
      prompt: "Worrying too much about different things",
      options: FREQ_OPTIONS,
    },
    { prompt: "Trouble relaxing", options: FREQ_OPTIONS },
    {
      prompt: "Being so restless that it is hard to sit still",
      options: FREQ_OPTIONS,
    },
    { prompt: "Becoming easily annoyed or irritable", options: FREQ_OPTIONS },
    {
      prompt: "Feeling afraid as if something awful might happen",
      options: FREQ_OPTIONS,
    },
  ],
  bands: [
    { min: 0, max: 4, label: "Minimal", severity: "none" },
    { min: 5, max: 9, label: "Mild", severity: "mild" },
    { min: 10, max: 14, label: "Moderate", severity: "moderate" },
    { min: 15, max: 21, label: "Severe", severity: "severe" },
  ],
};

const YN_OPTIONS = [
  { label: "No", value: 0 },
  { label: "Yes", value: 1 },
] as const;

export const CSSRS_LITE: Screener = {
  id: "cssrs",
  name: "Columbia Suicide Severity Rating Scale (lite, past month)",
  short: "C-SSRS",
  description:
    "In the past month — answer honestly. Any 'Yes' raises a safety flag for clinical follow-up.",
  items: [
    {
      prompt: "Have you wished you were dead or wished you could go to sleep and not wake up?",
      options: YN_OPTIONS,
    },
    {
      prompt: "Have you actually had any thoughts of killing yourself?",
      options: YN_OPTIONS,
    },
    {
      prompt:
        "Have you been thinking about how you might do it (no plan or intent yet)?",
      options: YN_OPTIONS,
    },
    {
      prompt:
        "Have you had these thoughts and had some intention of acting on them?",
      options: YN_OPTIONS,
    },
    {
      prompt:
        "Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?",
      options: YN_OPTIONS,
    },
    {
      prompt:
        "Have you ever done anything, started to do anything, or prepared to do anything to end your life — in your lifetime?",
      options: YN_OPTIONS,
    },
  ],
  flagThreshold: 1,
};

export const SCREENERS: readonly Screener[] = [PHQ9, GAD7, CSSRS_LITE];

export type ScreenerResponses = Record<number, number | null>;

export function totalScore(responses: ScreenerResponses, itemCount: number): number {
  let t = 0;
  for (let i = 0; i < itemCount; i++) {
    const v = responses[i];
    if (typeof v === "number") t += v;
  }
  return t;
}

export function bandFor(score: number, bands: readonly ScreenerBand[] | undefined): ScreenerBand | null {
  if (!bands) return null;
  return bands.find((b) => score >= b.min && score <= b.max) ?? null;
}

export function isComplete(responses: ScreenerResponses, itemCount: number): boolean {
  for (let i = 0; i < itemCount; i++) {
    if (typeof responses[i] !== "number") return false;
  }
  return true;
}

export function flagItems(
  responses: ScreenerResponses,
  screener: Screener
): Array<{ idx: number; prompt: string; value: number }> {
  if (!screener.flagThreshold) return [];
  const flagged: Array<{ idx: number; prompt: string; value: number }> = [];
  for (let i = 0; i < screener.items.length; i++) {
    const v = responses[i];
    if (typeof v === "number" && v >= screener.flagThreshold) {
      // PHQ-9 only flags item 9 (suicidality); C-SSRS flags any yes
      if (screener.id === "phq9" && i !== 8) continue;
      flagged.push({ idx: i, prompt: screener.items[i].prompt, value: v });
    }
  }
  return flagged;
}
