import type { Light } from "@/lib/utils";

export type AdvisorCoachPayload = {
  segment: number;
  segmentName: string;
  payorName: string | null;
  payorLight: Light | null;
  checklist: Record<string, boolean>;
  objection: string | null;
  alerts?: string[];
  asamMaxDim?: number;
  userMessage: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
};

export type InvokeRequest =
  | { op: "advisor.coach"; payload: AdvisorCoachPayload }
  | { op: "advisor.summary"; payload: { callLog: unknown } }
  | { op: "advisor.narrative"; payload: { assessment: unknown } }
  | { op: "paa.submit"; payload: { assessment: unknown; recipients: { clinicalDir: string; medDir?: string } } };

export type InvokeResponse =
  | { ok: true; text?: string; modelLatencyMs?: number; [key: string]: unknown }
  | { ok: false; error: string };
