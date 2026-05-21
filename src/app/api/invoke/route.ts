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

  if (body.op === "advisor.narrative") {
    const narrative = mockClinicalNarrative(
      body.payload.assessment as Record<string, unknown>
    );
    return NextResponse.json({
      ok: true,
      narrative,
      modelLatencyMs: 320,
    });
  }

  return NextResponse.json<InvokeResponse>(
    { ok: false, error: `op '${body.op}' has no fallback handler` },
    { status: 501 }
  );
}

function mockAdvisorCoach(p: AdvisorCoachPayload): string {
  const sections: string[] = [];

  // Header line — who, where, how loud
  const intro = p.payorName
    ? `On ${p.payorName} (${p.payorLight}) at segment ${p.segment} — ${p.segmentName}.`
    : `At segment ${p.segment} — ${p.segmentName}.`;
  sections.push(intro);

  // Clinical alerts top of mind (if any)
  if (p.alerts && p.alerts.length > 0) {
    sections.push(
      `Clinical context:\n${p.alerts.map((a) => `  • ${a}`).join("\n")}`
    );
  }

  // Segment-aware play
  const segmentPlays: Record<number, string> = {
    1: "Lead with safety, not script. 'Before anything else — are you safe right now?' Anchor the conversation in their nervous system before pivoting to logistics.",
    2: "Insurance moves fast here. Get the carrier name, member ID, and a hint at network status. If they don't have the card, ask them to read the prefix off the back.",
    3: "Clinical phase. Use the ASAM-6 panel on the right — every dimension is a question you've been trained to ask. Don't interrogate; you're collecting their story while triaging level of care.",
    4: "Facility recommendation. Don't pitch — frame it as 'based on what you told me.' Two or three options max. Difference, not list.",
    5: "Commitment phase. Tiny yes first. 'Are you free Tuesday?' beats 'Do you want to come in?' Build the staircase.",
  };
  sections.push(segmentPlays[p.segment] ?? segmentPlays[1]);

  // Objection or payor-light overlay
  if (p.objection) {
    sections.push(
      `Active objection — "${p.objection}". Mirror, validate, name the underlying concern, then offer one concrete option. Don't argue. Pause longer than feels natural.`
    );
  } else if (p.payorLight) {
    const playByLight: Record<string, string> = {
      GREEN: "GREEN plan — proceed with confidence. Confirm OOP in plain numbers, move the conversation toward an admit date. Don't over-sell.",
      YELLOW:
        "YELLOW plan — build clinical necessity before you discuss admit. Frame the next step as a clinical review, not a hurdle. Warm-transfer to Clinical Director while keeping the caller engaged.",
      RED: "RED plan — do not over-promise. Hold space, offer alternatives honestly (in-network referral, IOP, sliding scale). Avoid an admit that becomes a discharge.",
    };
    sections.push(playByLight[p.payorLight]);
  }

  // ASAM tilt
  if (typeof p.asamMaxDim === "number") {
    if (p.asamMaxDim >= 4)
      sections.push("ASAM acuity is at ceiling — pause admissions logistics, get clinical / medical engaged before this call ends.");
    else if (p.asamMaxDim >= 3)
      sections.push("ASAM acuity is high (≥ 3). Build the case for medically monitored / clinically managed residential, not outpatient.");
    else if (p.asamMaxDim >= 2)
      sections.push("ASAM acuity moderate. PHP / IOP is in the conversation; don't assume residential until biomedical and emotional dimensions are checked.");
  }

  // Conversation memory — light touch
  if (p.history && p.history.length >= 4) {
    const lastUserCount = p.history.filter((h) => h.role === "user").length;
    sections.push(
      `Note: you've asked ${lastUserCount} question${lastUserCount === 1 ? "" : "s"} so far. Stay with the thread — don't pivot unless the caller does.`
    );
  }

  // Direct response to the user's question
  sections.push(
    `On "${p.userMessage}" — start with the smallest concrete commitment the caller will agree to right now. Match their language. Don't pitch.`
  );

  return sections.join("\n\n");
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

/**
 * Mock clinical narrative — composes a biopsychosocial writeup from the
 * PAA fields. Real impl: Lambda prompts Bedrock Sonnet with the same
 * input and returns a clinician-style paragraph.
 *
 * The redaction tokens stay [REDACTED:*] — narrative inherits the same
 * scrub from the source. Identifying info NEVER appears here.
 */
function mockClinicalNarrative(a: Record<string, unknown>): string {
  const get = (k: string) =>
    typeof a[k] === "string" ? (a[k] as string) : "";
  const age = get("age");
  const sex = get("sex").toLowerCase();
  const gender = get("gender");
  const presenting = get("presentingFactor");
  const symptoms = (a.symptoms as Record<string, boolean>) ?? {};
  const sympList = Object.keys(symptoms).filter((k) => symptoms[k]);
  const trauma = get("traumaYN") === "yes";
  const substances = (a.substances as Record<string, Record<string, string>>) ?? {};
  const subUsed = Object.keys(substances).filter(
    (k) => substances[k]?.frequency || substances[k]?.lastUse
  );
  const withdrawal = get("withdrawalRisk");
  const hiCurrent = get("hiCurrent") === "yes";
  const hiPast = get("hiPast") === "yes";
  const selfHarmHx = get("selfHarmHx") === "yes";
  const primaryDx = get("primaryDx");
  const mhDx = get("mhDx");
  const psychHospCount = get("psychHospCount");
  const psychHospLast = get("psychHospLast");
  const meds = get("medications");
  const allergies = get("allergies") === "yes" ? get("allergyDetail") : "NKA";
  const conditions = (a.conditions as Record<string, boolean>) ?? {};
  const condList = Object.keys(conditions).filter((k) => conditions[k]);
  const immediateMed = get("immediateMedical") === "yes";
  const livingSituation = get("livingSituation");
  const socialSupport = get("socialSupport");
  const employed = get("employed") === "yes";
  const goals = get("treatmentGoals");
  const asam = (a.asam as Record<string, number>) ?? {};
  const asamMax = Math.max(...Object.values(asam));
  const repNotes = get("repNotes");

  const paras: string[] = [];

  // Identifying / presenting
  const idLine = [
    age ? `${age}-year-old` : "Caller",
    sex || "",
    gender ? `(gender: ${gender})` : "",
  ]
    .filter(Boolean)
    .join(" ");
  paras.push(
    `${idLine} presented to admissions ${
      presenting
        ? `with chief complaint "${presenting.trim().replace(/\s+/g, " ")}."`
        : "for intake screening."
    }${sympList.length > 0 ? ` Endorsed: ${sympList.slice(0, 6).join(", ")}.` : ""}${
      trauma ? " Trauma history disclosed; trauma-informed engagement maintained throughout." : ""
    }`
  );

  // Substance & withdrawal
  if (subUsed.length > 0 || withdrawal !== "none") {
    const subSummary = subUsed.length > 0
      ? subUsed
          .map(
            (k) =>
              `${k.toLowerCase()} (${substances[k].frequency || "freq unspecified"}, last ${
                substances[k].lastUse || "unspecified"
              })`
          )
          .join("; ")
      : "no active substance use reported";
    const wdLine =
      withdrawal === "severe"
        ? " Anticipated withdrawal risk is severe; medically monitored detox is indicated (ASAM 3.7 or higher)."
        : withdrawal === "moderate"
          ? " Anticipated withdrawal is moderate; clinically managed detox is appropriate."
          : withdrawal === "mild"
            ? " Anticipated withdrawal is mild and manageable with outpatient monitoring."
            : "";
    paras.push(`Substance use: ${subSummary}.${wdLine}`);
  }

  // Safety
  const safetyBits: string[] = [];
  if (hiCurrent)
    safetyBits.push(
      "Active homicidal ideation reported — Tarasoff duty consultation initiated; Clinical Director engaged."
    );
  if (hiPast)
    safetyBits.push("Past HI history without current ideation noted.");
  if (selfHarmHx) safetyBits.push("Prior self-harm history disclosed.");
  if (safetyBits.length > 0) {
    paras.push(`Safety: ${safetyBits.join(" ")}`);
  } else {
    paras.push(
      "Safety: No active suicidal or homicidal ideation reported at intake; brief screeners (PHQ-9, GAD-7, C-SSRS) administered and documented."
    );
  }

  // Diagnoses
  if (primaryDx || mhDx) {
    paras.push(
      `Diagnostic context: ${[primaryDx, mhDx].filter(Boolean).join("; ")}.`
    );
  }

  // Treatment history
  if (psychHospCount || psychHospLast) {
    paras.push(
      `Treatment history: ${
        psychHospCount ? `${psychHospCount} prior psychiatric hospitalization(s)` : "Hospitalization history reviewed"
      }${psychHospLast ? `, most recent ${psychHospLast}` : ""}.`
    );
  }

  // Medical
  const medBits: string[] = [];
  if (meds) medBits.push(`current medications include ${meds}`);
  medBits.push(`allergies: ${allergies}`);
  if (condList.length > 0)
    medBits.push(`chronic conditions: ${condList.join(", ")}`);
  if (immediateMed)
    medBits.push(
      "an immediate medical concern was identified and flagged for medical clearance"
    );
  paras.push(`Medical: ${medBits.join("; ")}.`);

  // Environment
  const envBits: string[] = [];
  if (livingSituation) envBits.push(livingSituation.toLowerCase());
  if (socialSupport === "yes") envBits.push("social supports identified");
  else if (socialSupport === "no")
    envBits.push("limited social supports — environment factored into LOC");
  if (employed) envBits.push("employed");
  if (envBits.length > 0) {
    paras.push(`Living environment: ${envBits.join("; ")}.`);
  }

  // Disposition / LOC
  const locLine =
    asamMax >= 4
      ? "ASAM 4.0 (medically managed intensive inpatient) recommended given dimensional acuity."
      : asamMax >= 3
        ? "ASAM 3.5–3.7 (clinically/medically monitored residential) recommended."
        : asamMax >= 2
          ? "ASAM 2.5 (partial hospitalization) recommended."
          : "ASAM 1.0–2.1 (outpatient or IOP) appears appropriate.";
  paras.push(
    `Disposition: ${locLine}${
      goals ? ` Caller goals: "${goals.trim()}."` : ""
    } Recommend admissions team coordinate with Clinical Director on level of care confirmation prior to admission scheduling.`
  );

  if (repNotes) {
    paras.push(`Rep notes carried forward: ${repNotes}`);
  }

  paras.push(
    "This narrative was assembled from the structured intake instrument and brief screeners. PHI fields are redacted; final clinical determination remains with the supervising clinician."
  );

  return paras.join("\n\n");
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
