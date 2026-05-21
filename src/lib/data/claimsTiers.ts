import type { Light } from "../utils";

export type ClaimsPhase = {
  phase: string;
  timeline: string;
  action: string;
  rate: string;
};

export type ClaimsTier = {
  label: string;
  strategy: string;
  phases: ClaimsPhase[];
};

export const CLAIMS_TIERS: Record<Light, ClaimsTier> = {
  GREEN: {
    label: "Green (65–90%)",
    strategy: "Aggressive defense of every claim",
    phases: [
      { phase: "Initial Claim", timeline: "Day 0–10", action: "Comprehensive clinical documentation", rate: "80–85%" },
      { phase: "Denial", timeline: "Day 30–45", action: "Immediate peer-to-peer request", rate: "75%" },
      { phase: "First Appeal", timeline: "Day 45–60", action: "Detailed clinical appeal + records", rate: "85%" },
      { phase: "Second Appeal", timeline: "Day 75–90", action: "External review", rate: "70%" },
    ],
  },
  YELLOW: {
    label: "Yellow (30–55%)",
    strategy: "Selective — prioritize >$10K claims",
    phases: [
      { phase: "Initial Claim", timeline: "Day 0–10", action: "Standard documentation", rate: "50–60%" },
      { phase: "Denial", timeline: "Day 30–45", action: "Evaluate ROI (>$10K proceed)", rate: "55%" },
      { phase: "First Appeal", timeline: "Day 45–75", action: "Targeted clinical appeal", rate: "65%" },
    ],
  },
  RED: {
    label: "Red (0–20%)",
    strategy: "Minimal effort — fast exit, route to in-network referral",
    phases: [
      { phase: "Initial Claim", timeline: "Day 0–10", action: "Basic submission only", rate: "15–25%" },
      { phase: "Denial", timeline: "Day 30", action: "Single appeal if >$25K only", rate: "20%" },
    ],
  },
};
