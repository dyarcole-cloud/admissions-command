/**
 * Crisis protocols — clinician-vetted scripts to anchor staff in real
 * crisis moments on an admissions call.
 *
 * Borrowed from Intake AI's De-Escalation Engine pattern. Reviewed
 * language draws on QPR (Question/Persuade/Refer), trauma-informed
 * de-escalation, and SAMHSA crisis-intervention guidance.
 *
 * These are NOT a substitute for clinician judgment. They give the
 * rep a defensible structure to hold onto while a clinical
 * supervisor or 988 / Mobile Crisis is being engaged.
 */

export type CrisisId =
  | "si"
  | "hi"
  | "intox"
  | "violent"
  | "minor"
  | "medical";

export type CrisisStep = {
  label: string;
  script: string;
};

export type CrisisProtocol = {
  id: CrisisId;
  title: string;
  short: string;
  severity: "high" | "critical";
  trigger: string;
  immediateActions: readonly string[];
  steps: readonly CrisisStep[];
  resources: readonly { label: string; detail: string }[];
};

export const CRISIS_PROTOCOLS: readonly CrisisProtocol[] = [
  {
    id: "si",
    title: "Active Suicidal Ideation",
    short: "Active SI",
    severity: "critical",
    trigger:
      "Caller endorses thoughts of suicide, mentions a plan, has access to means, or describes intent.",
    immediateActions: [
      "Stay on the line. Do not transfer or place on hold.",
      "Open a parallel ping to Clinical Director via Teams now.",
      "Do not say 'commit suicide.' Use 'thoughts of ending your life' or 'thoughts of suicide.'",
    ],
    steps: [
      {
        label: "Acknowledge + ground",
        script:
          "I hear you. Thank you for telling me. I'm not going anywhere — I'm right here with you. Take a breath with me.",
      },
      {
        label: "Ask directly (Columbia-style)",
        script:
          "Are you having thoughts of ending your life right now? Do you have a plan? Do you have access to the means to act on that plan?",
      },
      {
        label: "Lethal-means safety",
        script:
          "Is there someone with you right now, or someone who can be? Can we work together to put distance between you and [the means]? Even a few rooms helps.",
      },
      {
        label: "Bridge to next step",
        script:
          "I want to get you to someone who can help right now. I'm going to bring a clinical team member into this call. You don't have to do this alone.",
      },
      {
        label: "Do NOT do",
        script:
          "Do not minimize ('it'll get better'). Do not problem-solve. Do not promise admission. Do not hang up.",
      },
    ],
    resources: [
      { label: "988 Suicide & Crisis Lifeline", detail: "Call or text 988 — warm transfer if caller can't stay engaged" },
      { label: "Crisis Text Line", detail: "Text HOME to 741741" },
      { label: "Local Mobile Crisis", detail: "Verify county on file; otherwise NAMI HelpLine 1-800-950-6264" },
      { label: "911", detail: "Only if imminent danger and caller cannot keep safe — coordinate w/ clinical lead first" },
    ],
  },
  {
    id: "hi",
    title: "Homicidal Ideation",
    short: "HI",
    severity: "critical",
    trigger:
      "Caller expresses intent or plan to harm a specific person. Tarasoff duty may apply.",
    immediateActions: [
      "Stay on the line. Get Clinical Director on a parallel channel immediately.",
      "Document verbatim — exact words, identified target, means, timeframe.",
      "Do not promise confidentiality.",
    ],
    steps: [
      {
        label: "Acknowledge without endorsing",
        script:
          "That sounds really intense. I want to make sure I understand what's happening so I can help.",
      },
      {
        label: "Clarify intent + target + means",
        script:
          "Are you having thoughts of hurting someone? Who specifically? Do you have a plan? Do you have access to means?",
      },
      {
        label: "State the duty",
        script:
          "I want to be honest with you — if there's a real risk that someone could be hurt, we have a responsibility to make sure they're safe. I'd rather work through this with you than around you.",
      },
      {
        label: "Bridge to clinical + legal",
        script:
          "I'm bringing our Clinical Director in right now. They can help us figure out the right next step together.",
      },
    ],
    resources: [
      { label: "Clinical Director", detail: "Immediate consult — required" },
      { label: "Medical Director", detail: "Tarasoff determination, duty-to-warn" },
      { label: "911", detail: "If target is identifiable and danger is imminent" },
    ],
  },
  {
    id: "intox",
    title: "Acute Intoxication",
    short: "Intox",
    severity: "high",
    trigger:
      "Caller appears actively under the influence — slurred speech, confusion, sedation, agitation.",
    immediateActions: [
      "Confirm safety before clinical content — are they driving? Are they alone? Are kids around?",
      "Keep voice calm and rhythmic; short sentences.",
      "Document presentation; you may need to re-screen tomorrow.",
    ],
    steps: [
      {
        label: "Ground in the room",
        script:
          "Hey — I'm here. Can you tell me where you are right now? Are you sitting somewhere safe?",
      },
      {
        label: "Safety check",
        script:
          "Is anyone with you? Are there children or other people who depend on you right now? Are you near a car?",
      },
      {
        label: "Don't take clinical history right now",
        script:
          "I want to hear everything — but I want you sober when we go through the medical questions. Can I call you back tomorrow at a time you'll be clearer?",
      },
      {
        label: "Bridge",
        script:
          "If anything changes tonight — if you feel unsafe — call 988 or go to your nearest ER. I'm going to text you my callback number now.",
      },
    ],
    resources: [
      { label: "Local detox / withdrawal management", detail: "If clinical concern for severe withdrawal" },
      { label: "988", detail: "Crisis support while intoxicated is appropriate" },
      { label: "Schedule sober callback", detail: "Defer formal clinical capture; log presentation" },
    ],
  },
  {
    id: "violent",
    title: "Violent / Aggressive / Threatening",
    short: "Violent",
    severity: "high",
    trigger:
      "Caller is yelling, threatening you or staff, or escalating verbally. Body of call is hostile.",
    immediateActions: [
      "Do not match energy. Lower your voice. Slow down.",
      "Do not argue, defend, or correct.",
      "If physical safety risk to anyone, end call and document.",
    ],
    steps: [
      {
        label: "Acknowledge",
        script:
          "I can tell you're really frustrated, and I'd be too. I'm not going to argue with you — I just want to help.",
      },
      {
        label: "Name + slow",
        script:
          "Can I just ask one thing? Can we slow down for a second so I make sure I'm hearing you right?",
      },
      {
        label: "Offer choice",
        script:
          "Two options — we keep going right now, or I have a clinical lead call you back in 20 minutes when you've had a second. Both are fine. Which do you want?",
      },
      {
        label: "Boundaries (only if needed)",
        script:
          "I want to keep helping you, and I can't do that if you threaten me. If we can't bring it down, I'm going to need to end the call and have my supervisor reach out.",
      },
    ],
    resources: [
      { label: "Supervisor / Clinical Director", detail: "Warm handoff if rep cannot continue safely" },
      { label: "Document verbatim", detail: "Exact threats, time, length of escalation" },
    ],
  },
  {
    id: "minor",
    title: "Minor Present / Unaccompanied Caller",
    short: "Minor",
    severity: "high",
    trigger:
      "Caller is under 18, or a minor is in the room, or a guardian is calling about a minor.",
    immediateActions: [
      "Confirm age first thing.",
      "Identify guardian status and consent capacity.",
      "Mandated reporting: confirm whether the minor is currently safe.",
    ],
    steps: [
      {
        label: "Age + consent",
        script:
          "Before we go further — can you confirm your age for me? Is a parent or guardian with you? Are they okay with us talking?",
      },
      {
        label: "Safety first",
        script:
          "I want to make sure you're somewhere safe. Are you home? Is anyone hurting you or someone else?",
      },
      {
        label: "Mandated-reporting check",
        script:
          "I need to be honest — if I hear that you or another child is being hurt, I have to make sure someone can help. That's not optional for me, and I want you to know that going in.",
      },
      {
        label: "Bridge to clinical + family",
        script:
          "Let's bring in our clinical lead. They can talk with you and your parent / guardian together about next steps.",
      },
    ],
    resources: [
      { label: "Childhelp National Hotline", detail: "1-800-422-4453 (4-A-CHILD)" },
      { label: "Local CPS", detail: "If active abuse/neglect concern" },
      { label: "Adolescent-specific LOC", detail: "ASAM 3.5 / 3.3 typically; coordinate with Clinical Director" },
    ],
  },
  {
    id: "medical",
    title: "Medical Emergency",
    short: "Medical",
    severity: "critical",
    trigger:
      "Caller reports chest pain, seizure, severe withdrawal symptoms, recent overdose, or other acute medical issue.",
    immediateActions: [
      "Treat as medical first, clinical intake second.",
      "Stay on the line. Get them to 911 if not already engaged.",
      "Document presentation, symptoms, last-use timestamp if relevant.",
    ],
    steps: [
      {
        label: "Get a yes/no",
        script:
          "I want to make sure of one thing right now — are you having chest pain, trouble breathing, or do you feel like you're going to pass out?",
      },
      {
        label: "Route to 911 immediately if yes",
        script:
          "I'm going to ask you to hang up and call 911 right now — or stay on with me while we get them on. You can call me back the second you're safe. That's my only ask.",
      },
      {
        label: "If recent overdose",
        script:
          "Is there naloxone (Narcan) in the home? If so, use it now. Then call 911. I will stay on the line. We can do this together.",
      },
      {
        label: "If severe withdrawal (alcohol / benzo)",
        script:
          "This is medically serious. You should not detox at home. Let me help you find a medically monitored detox today — and if you have a seizure history, we are calling 911 first.",
      },
    ],
    resources: [
      { label: "911", detail: "Always available; coordinate while staying engaged" },
      { label: "Poison Control", detail: "1-800-222-1222" },
      { label: "Naloxone (Narcan)", detail: "Use immediately if available + opioid overdose suspected" },
    ],
  },
];

export function findProtocol(id: CrisisId): CrisisProtocol | undefined {
  return CRISIS_PROTOCOLS.find((p) => p.id === id);
}
