export type CallSegment = {
  id: 1 | 2 | 3 | 4 | 5;
  name: string;
  time: string;
  glyph: string;
  /** Semantic tone — drives Nocturne color mapping in UI */
  tone: "rapport" | "data" | "clinical" | "options" | "commit";
  objectives: string;
  questions: string[];
  script: string;
};

export const CALL_SEGMENTS: CallSegment[] = [
  {
    id: 1,
    name: "Rapid Rapport",
    time: "0–60s",
    glyph: "R",
    tone: "rapport",
    objectives: "Build trust, identify pain point",
    questions: [
      "Warm greeting with source context",
      "What brought you to reach out today?",
      "Is this call for yourself or someone you care about?",
      "What feels most urgent right now?",
    ],
    script:
      "Thank you for calling. My name is [Name] and I'm here to help you find the right path forward. Before anything else — are you safe right now?",
  },
  {
    id: 2,
    name: "Insurance",
    time: "1–4 min",
    glyph: "I",
    tone: "data",
    objectives: "Qualify insurance, set financial expectations",
    questions: [
      "What insurance do you have?",
      "Can I get your Member ID and Group number?",
      "Any secondary insurance?",
      "Out-of-pocket max situation?",
    ],
    script:
      "I want to make sure we find the best financial path for you. Can you tell me the name of your insurance company and — if you have your card handy — the member ID?",
  },
  {
    id: 3,
    name: "Clinical",
    time: "4–8 min",
    glyph: "C",
    tone: "clinical",
    objectives: "Assess acuity, determine appropriate level of care",
    questions: [
      "Tell me about current substance use",
      "Any detox concerns or withdrawal history?",
      "Prior treatment history?",
      "Current medications?",
      "Mental health diagnoses?",
      "Any safety concerns?",
    ],
    script:
      "I'd like to understand what you're going through so we can match you with the right program. Can you tell me about your current use?",
  },
  {
    id: 4,
    name: "Facility",
    time: "8–12 min",
    glyph: "F",
    tone: "options",
    objectives: "Present 2–3 options, differentiate value",
    questions: [
      "Based on your needs, I recommend these options…",
      "Any geographic preferences?",
      "What matters most to you in a program?",
    ],
    script:
      "Based on what you've shared — your insurance, your clinical needs, and what matters to you — I'd recommend looking at these programs…",
  },
  {
    id: 5,
    name: "Commitment",
    time: "12–15 min",
    glyph: "X",
    tone: "commit",
    objectives: "Secure admission date, warm handoff",
    questions: [
      "When are you looking to start?",
      "Can we schedule intake for a specific date?",
      "Travel arrangements needed?",
      "Who should we keep in the loop?",
    ],
    script:
      "I'd love to get you connected with their team today. Are you available to start this week?",
  },
];
