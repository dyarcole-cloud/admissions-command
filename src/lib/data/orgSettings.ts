"use client";

export type OrgSettings = {
  orgName: string;
  short: string;
  facilities: string[];
  escalation: {
    clinicalDir: string;
    medicalDir: string;
    executive: string;
  };
  importedPayors: ImportedPayor[];
};

export type ImportedPayor = {
  id: string;
  name: string;
  plan: string;
  light: "GREEN" | "YELLOW" | "RED";
  source: string;
  importedAt: number;
};

const KEY = "acmd:org:v1";

export const DEFAULT_ORG: OrgSettings = {
  orgName: "Your Organization",
  short: "AC",
  facilities: [],
  escalation: { clinicalDir: "", medicalDir: "", executive: "" },
  importedPayors: [],
};

export function readOrg(): OrgSettings {
  if (typeof window === "undefined") return DEFAULT_ORG;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_ORG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ORG, ...parsed };
  } catch {
    return DEFAULT_ORG;
  }
}

export function writeOrg(o: OrgSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch {}
}
