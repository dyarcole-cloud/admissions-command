import type { Light } from "@/lib/utils";
import raw from "./_raw/payors-master.json";

/**
 * ANTN Payor Matrix 2026.04.27 — UPGRADE
 * 864 records, 5 row categories, 3 traffic lights.
 *
 * Source: ANTN_Payor_Matrix_2026_04.27.2026-UPGRADE.xlsx → MASTER sheet.
 * Re-import: drop a fresh export at src/lib/data/_raw/payors-master.json
 * (same shape: { data: [...], headers: [...], row_count: number }).
 */

export type AppealRoi = "HIGH" | "MEDIUM" | "LOW";
export type RowCategory =
  | "Commercial Carrier"
  | "Medicaid"
  | "Union / Public Sector"
  | "Government / Military"
  | "Legacy";
export type ConfidenceTag =
  | "VERIFIED"
  | "TRIANGULATED"
  | "INFERRED"
  | "INVENTORY"
  | "LEGACY (pre-2026 matrix)";

export type Payor = {
  id: string;
  parent: string;
  plan: string;
  idPattern: string;
  cardClues: string;
  oonPct: string;
  confidenceLevel: string;
  appealNotes: string;
  observedInNetwork: string;
  lastUpdated: string;
  light: Light;
  appealRoi: AppealRoi | "";
  losDays: string;
  estPerDay: string;
  notesConfidence: string;
  decisionStatus: string;
  admitRule: string;
  exceptionAuthority: string;
  appealPriority: string;
  denialPattern: string;
  timelyFilingDays: string;
  priorAuthRequired: string;
  medNecessityThreshold: string;
  networkLeakageRisk: string;
  contractualOpportunity: string;
  volumePotential: string;
  strategicPriority: string;
  sourceUrl: string;
  confidenceTag: ConfidenceTag | "";
  serviceLineScope: string;
  rowCategory: RowCategory;
};

type RawRow = Record<string, string>;
type RawMaster = { data: RawRow[]; row_count: number };

const RAW = raw as RawMaster;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeLight(s: string): Light {
  const t = (s || "").toUpperCase().replace(/[^A-Z]/g, "");
  if (t.includes("RED")) return "RED";
  if (t.includes("YELLOW")) return "YELLOW";
  return "GREEN";
}

function normalizeAppealRoi(s: string): AppealRoi | "" {
  const t = (s || "").toUpperCase().trim();
  if (t === "HIGH" || t === "MEDIUM" || t === "LOW") return t;
  return "";
}

function normalizeCategory(s: string): RowCategory {
  const t = (s || "").trim();
  if (t.startsWith("Commercial")) return "Commercial Carrier";
  if (t.startsWith("Medicaid")) return "Medicaid";
  if (t.startsWith("Union")) return "Union / Public Sector";
  if (t.startsWith("Government")) return "Government / Military";
  return "Legacy";
}

function normalizeConfidenceTag(s: string): ConfidenceTag | "" {
  const t = (s || "").trim();
  if (
    t === "VERIFIED" ||
    t === "TRIANGULATED" ||
    t === "INFERRED" ||
    t === "INVENTORY" ||
    t === "LEGACY (pre-2026 matrix)"
  ) {
    return t;
  }
  return "";
}

const PAYORS: Payor[] = (() => {
  const seen = new Set<string>();
  const out: Payor[] = [];
  for (const r of RAW.data) {
    const parent = (r["Payor (Parent)"] || "").trim();
    const plan = (r["Policy / Product Name"] || "").trim();
    if (!parent) continue;
    let id = slugify(`${parent}-${plan || "default"}`);
    let n = 1;
    while (seen.has(id)) {
      n += 1;
      id = `${slugify(`${parent}-${plan || "default"}`)}-${n}`;
    }
    seen.add(id);
    out.push({
      id,
      parent,
      plan,
      idPattern: r["Typical Prefix / ID Pattern"] || "",
      cardClues:
        r["Identifier on Card (Prefix / Network / Group Clue)"] || "",
      oonPct: r["Estimated OON Reimbursement %"] || "",
      confidenceLevel: r["Confidence Level"] || "",
      appealNotes: r["Appeal / UR Notes"] || "",
      observedInNetwork: r["Observed in Network (Y/N)"] || "",
      lastUpdated: r["Last Updated"] || "",
      light: normalizeLight(r["Traffic Light"] || ""),
      appealRoi: normalizeAppealRoi(r["Appeal ROI"] || ""),
      losDays: r["LOS Sweet Spot (Days)"] || "",
      estPerDay: r["Est $ / Bed / Day"] || "",
      notesConfidence: r["Notes (Prefix Confidence)"] || "",
      decisionStatus: r["Decision Status"] || "",
      admitRule: r["Admit Rule"] || "",
      exceptionAuthority: r["Exception Authority"] || "",
      appealPriority: r["Appeal Priority"] || "",
      denialPattern: r["Denial Pattern"] || "",
      timelyFilingDays: r["Timely Filing (Days)"] || "",
      priorAuthRequired: r["Prior Auth Required"] || "",
      medNecessityThreshold: r["Medical Necessity Threshold"] || "",
      networkLeakageRisk: r["Network Leakage Risk"] || "",
      contractualOpportunity: r["Contractual Opportunity"] || "",
      volumePotential: r["Volume Potential"] || "",
      strategicPriority: r["Strategic Priority"] || "",
      sourceUrl: r["Source URL / Citation"] || "",
      confidenceTag: normalizeConfidenceTag(
        r["Confidence Tag (VERIFIED/TRIANGULATED/INFERRED/UNKNOWN)"] || ""
      ),
      serviceLineScope:
        r[
          "Service Line Scope (Res MH | Detox | PHP | IOP MH | IOP SUD | OP)"
        ] || "",
      rowCategory: normalizeCategory(
        r["Row Category (Commercial/Medicaid/Union/GovMil)"] || ""
      ),
    });
  }
  return out;
})();

export type PayorFilter = {
  q?: string;
  light?: Light | "ALL";
  category?: RowCategory | "ALL";
  limit?: number;
};

export function getAllPayors(): Payor[] {
  return PAYORS;
}

export function findPayorById(id: string): Payor | undefined {
  return PAYORS.find((p) => p.id === id);
}

export function searchPayors(filter: PayorFilter = {}): Payor[] {
  const { q, light, category, limit } = filter;
  const ql = q?.trim().toLowerCase() ?? "";
  let out = PAYORS;
  if (light && light !== "ALL") out = out.filter((p) => p.light === light);
  if (category && category !== "ALL")
    out = out.filter((p) => p.rowCategory === category);
  if (ql) {
    out = out.filter((p) => {
      const hay = `${p.parent} ${p.plan} ${p.cardClues} ${p.idPattern}`.toLowerCase();
      return hay.includes(ql);
    });
  }
  if (limit && out.length > limit) out = out.slice(0, limit);
  return out;
}

export function payorCounts(): {
  total: number;
  byLight: Record<Light, number>;
  byCategory: Record<RowCategory, number>;
} {
  const byLight: Record<Light, number> = { GREEN: 0, YELLOW: 0, RED: 0 };
  const byCategory: Record<RowCategory, number> = {
    "Commercial Carrier": 0,
    Medicaid: 0,
    "Union / Public Sector": 0,
    "Government / Military": 0,
    Legacy: 0,
  };
  for (const p of PAYORS) {
    byLight[p.light] += 1;
    byCategory[p.rowCategory] += 1;
  }
  return { total: PAYORS.length, byLight, byCategory };
}

/** Bridge to the cockpit's older PayorSummary shape so existing UI keeps working. */
import type { PayorSummary } from "./demoScenarios";
export function toPayorSummary(p: Payor): PayorSummary {
  return {
    light: p.light,
    oonPct: p.oonPct || "—",
    admitRule: p.admitRule || "—",
    losDays: p.losDays || "—",
    estPerDay: p.estPerDay || "—",
    denialProb: p.denialPattern || "—",
    appealROI: (p.appealRoi || "MEDIUM") as PayorSummary["appealROI"],
  };
}
