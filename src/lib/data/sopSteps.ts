export type SopStep = {
  step: number;
  role: "Admissions" | "System" | "Clinical Dir." | "Executive" | "UR / Billing";
  action: string;
  output: string;
  auto: boolean;
};

export const SOP_STEPS: SopStep[] = [
  { step: 1, role: "Admissions", action: "Enter payor + policy exactly as on card", output: "Payor identified", auto: true },
  { step: 2, role: "Admissions", action: "Match employer / union from list", output: "Employer matched", auto: true },
  { step: 3, role: "System", action: "Auto-assign risk level from matrix", output: "Risk: Low / Medium / High", auto: true },
  { step: 4, role: "System", action: "Auto-populate decision status", output: "GREEN / YELLOW / RED", auto: true },
  { step: 5, role: "Admissions", action: "GREEN → proceed with admit", output: "Admit scheduled", auto: false },
  { step: 6, role: "Clinical Dir.", action: "YELLOW → clinical necessity review", output: "Approve or escalate to Clinical Director", auto: false },
  { step: 7, role: "Executive", action: "RED → exception-only review", output: "Approve or route to in-network referral", auto: false },
  { step: 8, role: "UR / Billing", action: "Prepare appeal strategy", output: "Appeal submitted", auto: false },
];
