import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
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

  if (body.op === "advisor.coach") {
    return NextResponse.json<InvokeResponse>({
      ok: true,
      text: mockAdvisorCoach(body.payload),
      modelLatencyMs: 240,
    });
  }

  if (body.op === "paa.submit") {
    const { redactedSummary, redactionCount, phiHashes } = mockDeid(
      body.payload.assessment as Record<string, unknown>
    );
    return NextResponse.json({
      ok: true,
      assessmentId: randomUUID(),
      redactedSummary,
      redactionCount,
      phiHashes,
      // Audit row would write to Firestore in week-2 wiring
      auditLogId: randomUUID(),
      sesMessageId: null,
      modelLatencyMs: 180,
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

/**
 * Mock DEID — pattern-based PHI redaction stand-in for AWS Comprehend
 * Medical. Replaces the eighteen HIPAA identifiers where possible:
 *   NAME, DATE, PHONE, EMAIL, ADDRESS, ID, FAX, SSN, MRN.
 *
 * Real production: Lambda → comprehendmedical.detectPHI → entities
 * mapped to [REDACTED:{Category}] with confidence > 0.9. Sha256 of
 * each raw PHI string is written to audit_log.
 */
function mockDeid(assessment: Record<string, unknown>): {
  redactedSummary: string;
  redactionCount: number;
  phiHashes: string[];
} {
  const collected: Array<{ value: string; category: string }> = [];

  const grabValue = (key: string, category: string) => {
    const v = assessment[key];
    if (typeof v === "string" && v.trim().length > 0) {
      collected.push({ value: v.trim(), category });
    }
  };

  grabValue("name", "NAME");
  grabValue("dob", "DATE");
  grabValue("address", "ADDRESS");
  grabValue("contactValue", "CONTACT");
  grabValue("conservatorContact", "NAME");
  grabValue("psychHospLast", "DATE");

  // Build a free-text summary that includes assessment narrative fields
  const text = buildText(assessment);

  // Apply regex passes for any inline PHI patterns the user typed into
  // free-text fields.
  const patterns: Array<{ re: RegExp; category: string }> = [
    {
      re: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
      category: "SSN",
    },
    {
      re: /\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      category: "PHONE",
    },
    {
      re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      category: "EMAIL",
    },
    {
      re: /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/g,
      category: "DATE",
    },
    {
      re: /\b\d+\s+(?:N|S|E|W|North|South|East|West)?\s?[A-Z][a-z]+\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Dr|Drive|Ct|Court|Pl|Place|Way|Hwy|Highway)\b\.?/g,
      category: "ADDRESS",
    },
    {
      re: /\bMRN[:\s]?\w+/gi,
      category: "ID",
    },
  ];

  let redacted = text;
  const replacements: Array<{ orig: string; tag: string }> = [];

  // First replace structured assessment fields by exact match
  for (const c of collected) {
    const tag = `[REDACTED:${c.category}]`;
    if (redacted.includes(c.value)) {
      const safeFind = c.value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const re = new RegExp(safeFind, "g");
      redacted = redacted.replace(re, tag);
      replacements.push({ orig: c.value, tag });
    }
  }

  // Then regex passes for any inline patterns missed
  for (const p of patterns) {
    redacted = redacted.replace(p.re, (m) => {
      replacements.push({ orig: m, tag: `[REDACTED:${p.category}]` });
      return `[REDACTED:${p.category}]`;
    });
  }

  const phiHashes = replacements.map((r) =>
    createHash("sha256").update(r.orig).digest("hex").slice(0, 16)
  );

  return {
    redactedSummary: redacted,
    redactionCount: replacements.length,
    phiHashes,
  };
}

function buildText(a: Record<string, unknown>): string {
  const get = (k: string) =>
    typeof a[k] === "string" ? (a[k] as string) : "";

  const lines: string[] = [];
  lines.push("CLINICAL HANDOFF — ADMISSIONS INTAKE (DEID summary)");
  lines.push(`Submitted: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("CALLER:");
  lines.push(
    `  Name: ${get("name")} · DOB: ${get("dob")} · Age: ${get("age")} · Sex: ${get("sex")} · Gender: ${get("gender")}`
  );
  lines.push(`  Address: ${get("address")}`);
  lines.push(
    `  Preferred contact: ${get("preferredContact") || "—"} · ${get("contactValue") || "—"}`
  );
  lines.push("");
  lines.push("PRESENTING:");
  lines.push(`  ${get("presentingFactor") || "—"}`);

  const symptoms = (a.symptoms as Record<string, boolean>) ?? {};
  const sympList = Object.keys(symptoms).filter((k) => symptoms[k]);
  if (sympList.length > 0) {
    lines.push(`  Symptoms: ${sympList.join(", ")}`);
  }
  if (get("traumaYN") === "yes" && get("traumaDetail")) {
    lines.push(`  Trauma: ${get("traumaDetail")}`);
  }

  const substances = (a.substances as Record<string, Record<string, string>>) ?? {};
  const subUsed = Object.keys(substances).filter(
    (k) =>
      substances[k]?.frequency ||
      substances[k]?.lastUse ||
      substances[k]?.amount
  );
  if (subUsed.length > 0) {
    lines.push("");
    lines.push("SUBSTANCE USE:");
    subUsed.forEach((k) =>
      lines.push(
        `  ${k} — freq: ${substances[k].frequency || "?"} · last: ${
          substances[k].lastUse || "?"
        } · route: ${substances[k].route || "?"}`
      )
    );
  }
  if (get("withdrawalRisk") !== "none") {
    lines.push(`  Withdrawal risk: ${get("withdrawalRisk")}`);
  }
  if (get("detoxHx")) {
    lines.push(`  Detox hx: ${get("detoxHx")}`);
  }

  lines.push("");
  lines.push("SAFETY:");
  lines.push(`  Self-harm hx: ${get("selfHarmHx")}`);
  lines.push(
    `  HI — current: ${get("hiCurrent")} · past: ${get("hiPast")}`
  );
  if (get("hiDetail")) lines.push(`    detail: ${get("hiDetail")}`);
  if (get("safetyPlan")) lines.push(`  Safety plan: ${get("safetyPlan")}`);

  if (get("primaryDx") || get("mhDx")) {
    lines.push("");
    lines.push("DIAGNOSES:");
    if (get("primaryDx")) lines.push(`  Primary: ${get("primaryDx")}`);
    if (get("mhDx")) lines.push(`  Other: ${get("mhDx")}`);
  }

  if (get("legalIssues") || get("probationOrParole") !== "no") {
    lines.push("");
    lines.push("LEGAL:");
    if (get("legalIssues")) lines.push(`  ${get("legalIssues")}`);
    if (get("probationOrParole") !== "no")
      lines.push(`  Probation/parole: ${get("probationOrParole")}`);
  }

  const asd = (a.asdScores as number[]) ?? [0, 0, 0, 0, 0, 0];
  const asdTotal = asd.reduce((x, y) => x + y, 0);
  if (asdTotal > 0) {
    lines.push("");
    lines.push(`ASD/IDD SCREEN: total ${asdTotal}/18`);
    if (get("asdNote")) lines.push(`  ${get("asdNote")}`);
  }

  if (get("medications")) {
    lines.push("");
    lines.push("MEDICAL:");
    lines.push(`  Meds: ${get("medications")}`);
    if (get("allergies") === "yes" && get("allergyDetail"))
      lines.push(`  Allergies: ${get("allergyDetail")}`);
    if (get("immediateMedical") === "yes")
      lines.push(`  Immediate medical concern: ${get("immediateMedicalDetail")}`);
  }

  if (get("livingSituation") || get("socialSupport") !== "no") {
    lines.push("");
    lines.push("ENVIRONMENT:");
    if (get("livingSituation")) lines.push(`  ${get("livingSituation")}`);
    if (get("socialSupportDetail"))
      lines.push(`  Supports: ${get("socialSupportDetail")}`);
    if (get("treatmentGoals"))
      lines.push(`  Goals: ${get("treatmentGoals")}`);
  }

  if (get("repNotes")) {
    lines.push("");
    lines.push("REP NOTES:");
    lines.push(`  ${get("repNotes")}`);
  }

  return lines.join("\n");
}
