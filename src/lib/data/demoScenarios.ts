import type { Light } from "../utils";

export type DemoStep = {
  time: string;
  action: string;
  result?: string;
};

export type PayorSummary = {
  light: Light;
  oonPct: string;
  admitRule: string;
  losDays: string;
  estPerDay: string;
  denialProb: string;
  appealROI: "HIGH" | "MEDIUM" | "LOW";
};

export type DemoScenario = {
  id: string;
  title: string;
  subtitle: string;
  light: Light;
  caller: string;
  insurance: string;
  payor: PayorSummary;
  revenue: number;
  costAvoided?: number;
  withoutTool: string;
  withTool: string;
  savings: string;
  steps: DemoStep[];
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "green",
    title: "The Confident Admit",
    subtitle: "Cigna MRC Tier 1 — 28-day residential",
    light: "GREEN",
    caller: "Sarah M.",
    insurance: "Cigna MRC Tier 1",
    payor: {
      light: "GREEN",
      oonPct: "65–90%",
      admitRule: "AUTO-ADMIT",
      losDays: "28–60",
      estPerDay: "$1,200–$2,000",
      denialProb: "Low (10–15%)",
      appealROI: "HIGH",
    },
    revenue: 42000,
    withoutTool:
      "Admissions rep spends 20 minutes researching this payor manually. Calls UR. Calls billing. Puts caller on hold twice. Sarah gets frustrated and calls another facility. You lose a $42,000 placement.",
    withTool:
      "Insurance auto-matches in 2 seconds. GREEN light appears. Rep sees 'AUTO-ADMIT' with 65–90% OON reimbursement. Confidently tells Sarah: 'Your insurance has excellent coverage for our program. We can get you in tomorrow.' Call takes 8 minutes. Placement secured.",
    savings: "$42,000 saved (1 placement retained)",
    steps: [
      { time: "0:00", action: "Call comes in. Rep types 'Cigna MRC' into insurance field.", result: "Instant match: GREEN — AUTO-ADMIT" },
      { time: "0:15", action: "AI Advisor confirms: 'This is a Tier 1 Cigna plan. Proceed with confidence. Expected reimbursement $1,200–2,000/day.'" },
      { time: "1:00", action: "Rep moves to Rapid Rapport. Script appears: 'Thank you for calling…' Checklist guides the conversation." },
      { time: "3:00", action: "Insurance segment auto-completed. System already knows LOS sweet spot is 28–60 days." },
      { time: "6:00", action: "Clinical assessment. Rep checks off diagnosis questions. AI suggests: 'Based on clinical acuity, recommend 30-day residential.'" },
      { time: "8:00", action: "Commitment. Rep schedules intake for tomorrow. Call logged as PLACED. Total time: 8 minutes vs. typical 20+." },
    ],
  },
  {
    id: "yellow",
    title: "The Clinical Save",
    subtitle: "Aetna FCR — needs necessity documentation",
    light: "YELLOW",
    caller: "David R.",
    insurance: "Aetna FCR MBB",
    payor: {
      light: "YELLOW",
      oonPct: "40–60%",
      admitRule: "CLINICAL REVIEW",
      losDays: "21–35",
      estPerDay: "$700–$1,200",
      denialProb: "Moderate (30–45%)",
      appealROI: "MEDIUM",
    },
    revenue: 25200,
    withoutTool:
      "Rep isn't sure about this plan. Says 'let me check and call you back.' Calls UR, waits 2 hours for a response. Calls David back — he's already been admitted at a competitor. Revenue lost: $25,200.",
    withTool:
      "YELLOW light appears instantly. System says 'CLINICAL REVIEW — get Clinical Director involved.' Rep tells David: 'Your plan requires a quick clinical review. I'm connecting you with our clinical team right now — can you stay on for 3 minutes?' AI Advisor coaches: 'Build necessity case around safety risk and failed outpatient.' Clinical Director approves. Intake scheduled same day.",
    savings: "$25,200 saved (1 YELLOW converted)",
    steps: [
      { time: "0:00", action: "Rep types 'Aetna FCR'. System matches instantly.", result: "YELLOW — CLINICAL REVIEW required" },
      { time: "0:15", action: "AI Advisor: 'This is a moderate-reimbursement plan. Build clinical necessity case. Focus on: failed prior treatment, safety concerns, medical complexity.'" },
      { time: "2:00", action: "Rep warm-transfers to Clinical Director while keeping David engaged. Script guides: 'David, while I connect you, can you tell me about your treatment history?'" },
      { time: "4:00", action: "Clinical Director reviews. System shows denial probability is 30–45% — worth fighting. Approves admission with documentation plan." },
      { time: "6:00", action: "Rep returns: 'David, we've reviewed everything and we'd like to get you in this week.' Intake scheduled." },
      { time: "7:00", action: "Call logged as PLACED with YELLOW payor. Appeal strategy pre-loaded in case of denial." },
    ],
  },
  {
    id: "red",
    title: "The Smart Decline",
    subtitle: "UHC Navigate EPO — high denial risk",
    light: "RED",
    caller: "Michael T.",
    insurance: "UHC Navigate EPO",
    payor: {
      light: "RED",
      oonPct: "0–20%",
      admitRule: "EXCEPTION ONLY",
      losDays: "≤14",
      estPerDay: "$0–$500",
      denialProb: "High (70–90%)",
      appealROI: "LOW",
    },
    revenue: 0,
    costAvoided: 8500,
    withoutTool:
      "Rep admits Michael without checking insurance. 3 days later, UR discovers the plan pays $0 OON. Michael has to be discharged mid-treatment. Facility absorbs $8,500 in unrecoverable costs. Michael's clinical outcome suffers. Family is furious. Bad Google review.",
    withTool:
      "RED light appears immediately. System says 'EXCEPTION ONLY — $0–500/day, 70–90% denial probability.' Rep doesn't panic — AI Advisor coaches: 'This plan has very limited OON coverage. Offer alternatives: in-network referral, IOP option, or self-pay sliding scale.' Rep provides warm referral to an in-network facility. Michael gets appropriate care. Your facility avoids $8,500 loss.",
    savings: "$8,500 in costs avoided",
    steps: [
      { time: "0:00", action: "Rep types 'UHC Navigate'. Instant match.", result: "RED — EXCEPTION ONLY. Est. $0–500/day." },
      { time: "0:10", action: "AI Advisor: 'Do NOT admit without executive approval. This plan reimburses $0–500/day with 70–90% denial rate. Offer alternatives.'" },
      { time: "1:00", action: "Rep to Michael: 'I want to make sure we find you the right fit. Let me look at some options that work best with your coverage.'" },
      { time: "2:00", action: "AI suggests: 'Refer to [in-network facility]. Or offer Campus VIOP as lower-cost alternative with this payor.'" },
      { time: "3:00", action: "Rep provides warm referral with facility name and phone number. Michael appreciates the honesty." },
      { time: "4:00", action: "Call logged as REFERRED. $8,500 bad-admit cost avoided. Relationship preserved for future referrals." },
    ],
  },
];
