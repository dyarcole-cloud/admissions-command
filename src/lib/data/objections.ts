export type Objection = {
  trigger: string;
  strategy: string;
  script: string;
};

export const OBJECTIONS: Objection[] = [
  {
    trigger: "I need to think about it",
    strategy: "Acknowledge + schedule follow-up",
    script:
      "I completely understand. Can I ask what specifically you'd like to think through? And can we set a time tomorrow to check in?",
  },
  {
    trigger: "I can't afford it",
    strategy: "Break down actual OOP + payment plans",
    script:
      "Cost is a real concern. Based on your insurance, your actual out-of-pocket would be approximately $[X]. We also have payment plan options.",
  },
  {
    trigger: "My family doesn't know",
    strategy: "Normalize + offer support",
    script:
      "That's actually really common. Would it be helpful if we scheduled a call where I can help you talk to them?",
  },
  {
    trigger: "I'm scared",
    strategy: "Validate + offer preview",
    script:
      "Fear is completely normal. Can I tell you what the first 24 hours actually look like? Most people tell us the anticipation was worse than the reality.",
  },
  {
    trigger: "I've tried before",
    strategy: "Explore prior experience + differentiate",
    script:
      "Can you tell me what happened last time — what worked and what didn't? That helps me find something genuinely different.",
  },
];
