/**
 * Motivational Interviewing prompt library — trauma-informed phrasings
 * indexed by call segment and emotional state. The aim is to keep the
 * rep's language consistent with MI fidelity even when the call is
 * unfolding fast.
 *
 * Techniques codified: OARS (Open question, Affirmation, Reflection,
 * Summary) + Change Talk + Trauma-informed cues.
 */

export type MiTechnique =
  | "open"
  | "affirm"
  | "reflect"
  | "summary"
  | "changeTalk"
  | "trauma";

export type MiPrompt = {
  technique: MiTechnique;
  trigger: string;
  script: string;
  /** Segment IDs this prompt is most useful in (1=Rapid Rapport...5=Commitment) */
  segments: readonly number[];
};

export const MI_PROMPTS: readonly MiPrompt[] = [
  {
    technique: "open",
    trigger: "Opening — caller hesitates",
    script:
      "What's been going on that made today feel like the day to reach out?",
    segments: [1],
  },
  {
    technique: "reflect",
    trigger: "Caller minimizes ('it's not that bad')",
    script:
      "It sounds like part of you is wondering if this is the right time — and part of you picked up the phone anyway. That part matters.",
    segments: [1, 3, 4],
  },
  {
    technique: "affirm",
    trigger: "Caller shows up scared",
    script:
      "Calling a place like ours is hard. You did the hardest thing already, just by being on this line with me.",
    segments: [1, 2, 5],
  },
  {
    technique: "trauma",
    trigger: "Caller describes a recent rupture / loss / trauma",
    script:
      "I'm not going to ask you to relive that right now. I just want to know — what would feel like a small piece of relief in the next 24 hours?",
    segments: [1, 3],
  },
  {
    technique: "open",
    trigger: "Insurance segment — caller defensive about money",
    script:
      "Cost is part of the picture for everyone — let's just look at it together. What number have you been carrying in your head?",
    segments: [2],
  },
  {
    technique: "reflect",
    trigger: "Caller says 'I've tried this before'",
    script:
      "You've put work into your recovery before. That tells me you know how to do hard things — and that something was missing last time. What was it?",
    segments: [3, 4],
  },
  {
    technique: "changeTalk",
    trigger: "Caller hints at wanting change ('I just can't keep doing this')",
    script:
      "Say more about that — 'can't keep doing this.' What changes if today is the day that ends?",
    segments: [3, 5],
  },
  {
    technique: "summary",
    trigger: "Mid-clinical — pulling threads together",
    script:
      "Let me make sure I have it: [substance pattern], [trigger], [last good period]. Did I get any of that wrong?",
    segments: [3],
  },
  {
    technique: "open",
    trigger: "Facility segment — caller is overwhelmed by options",
    script:
      "If we narrow it down — what's the one thing you'd want a program to feel like? Not what they offer, what the place feels like when you walk in.",
    segments: [4],
  },
  {
    technique: "affirm",
    trigger: "Caller commits to a date",
    script:
      "Picking the day is the second hard thing. Walking through the door is the third. We'll be there for both.",
    segments: [5],
  },
  {
    technique: "reflect",
    trigger: "Family pressure mentioned",
    script:
      "It sounds like other people have a stake in this with you — and you're holding that. Where do you want them in the conversation?",
    segments: [1, 4, 5],
  },
  {
    technique: "trauma",
    trigger: "Caller dissociates / goes flat",
    script:
      "I notice we got quiet. No rush. Are you with me? Can you tell me one thing in the room you can see?",
    segments: [1, 3, 4, 5],
  },
  {
    technique: "open",
    trigger: "Resistance — 'I don't think you can help me'",
    script:
      "I'd rather know what we'd need to do for you to feel like this is helping. What would it look like if I were actually useful right now?",
    segments: [1, 3, 4, 5],
  },
  {
    technique: "affirm",
    trigger: "Caller shares a strength incidentally",
    script:
      "I want to name that — what you just described took a lot to do. That's the kind of thing that carries over into treatment.",
    segments: [1, 3, 4, 5],
  },
  {
    technique: "summary",
    trigger: "Pre-commitment — staging the close",
    script:
      "Here's where we are: [insurance status], [clinical picture], [program fit]. The next move is just one thing — picking a date. Anything in the way of that?",
    segments: [4, 5],
  },
];

export function promptsForSegment(segmentId: number): MiPrompt[] {
  return MI_PROMPTS.filter((p) => p.segments.includes(segmentId));
}

export const TECHNIQUE_LABELS: Record<MiTechnique, string> = {
  open: "Open question",
  affirm: "Affirmation",
  reflect: "Reflection",
  summary: "Summary",
  changeTalk: "Change talk",
  trauma: "Trauma-informed",
};
