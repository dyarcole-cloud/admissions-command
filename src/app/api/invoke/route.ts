import { NextRequest, NextResponse } from "next/server";
import type {
  AdvisorCoachPayload,
  InvokeRequest,
  InvokeResponse,
} from "@/lib/invoke/types";

export const runtime = "nodejs";

const LAMBDA_URL = process.env.LAMBDA_INVOKE_URL;
const LAMBDA_TOKEN = process.env.LAMBDA_INVOKE_TOKEN;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as InvokeRequest;

  // When LAMBDA_INVOKE_URL is configured, forward the request server-side.
  // Auth headers + tenant claim resolution happen here, never client-side.
  if (LAMBDA_URL) {
    try {
      const upstream = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(LAMBDA_TOKEN ? { Authorization: `Bearer ${LAMBDA_TOKEN}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = (await upstream.json()) as InvokeResponse;
      return NextResponse.json(data, { status: upstream.status });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: `Lambda upstream error: ${(e as Error).message}` },
        { status: 502 }
      );
    }
  }

  // Fallback: deterministic mock response so the cockpit is usable in dev / preview
  // before AWS is configured. Mirrors the contract of the real Bedrock advisor.
  if (body.op === "advisor.coach") {
    const text = mockAdvisorCoach(body.payload);
    return NextResponse.json<InvokeResponse>({
      ok: true,
      text,
      modelLatencyMs: 240,
    });
  }

  return NextResponse.json<InvokeResponse>(
    { ok: false, error: `op '${body.op}' has no fallback handler` },
    { status: 501 }
  );
}

function mockAdvisorCoach(p: AdvisorCoachPayload): string {
  const intro = p.payorName
    ? `On ${p.payorName} (${p.payorLight}) at segment ${p.segment} — ${p.segmentName}:`
    : `At segment ${p.segment} — ${p.segmentName}:`;

  let body = "";
  if (p.objection) {
    body = `Caller objection "${p.objection}" — acknowledge first, then offer a concrete next step. Don't rush the validation. If the caller is afraid of cost, lead with the actual OOP estimate based on their plan; if they're afraid of treatment itself, walk them through the first 24 hours.`;
  } else {
    switch (p.payorLight) {
      case "GREEN":
        body =
          "This is a GREEN plan — proceed with confidence. Confirm the financial picture in plain numbers, then move the conversation toward an admit date. Don't over-sell; reassure.";
        break;
      case "YELLOW":
        body =
          "This is a YELLOW plan — build clinical necessity before you discuss admit. Frame the next step as a clinical review, not a hurdle. Warm-transfer to Clinical Director while keeping the caller engaged.";
        break;
      case "RED":
        body =
          "This is a RED plan — do not over-promise. Hold space for the caller, offer alternatives honestly (in-network referral, IOP, sliding scale). Avoid an admit that becomes a discharge.";
        break;
      default:
        body =
          "Confirm the payor first — that's the single fastest path to clarity. Once you have the light, the right next move follows. Until then, focus on rapport and the caller's immediate safety.";
    }
  }

  return `${intro}\n\n${body}\n\nYour question: "${p.userMessage}" — start with the smallest concrete commitment the caller will agree to right now.`;
}
