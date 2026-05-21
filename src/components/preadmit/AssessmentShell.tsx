"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Screener } from "./Screener";
import { SafetyFlagsPanel, deriveFlags } from "./SafetyFlags";
import { HandoffCard } from "./HandoffCard";
import { AsamScorer } from "@/components/cockpit/AsamScorer";
import { VoiceMic } from "@/components/app/VoiceMic";
import {
  PAA_SECTIONS,
  PAA_SYMPTOMS,
  PAA_SUBSTANCES,
  PAA_ASD_QS,
} from "@/lib/data/paa";
import {
  MEDICAL_CONDITIONS,
  blankPaa,
  type PaaState,
  type YesNoMaybe,
} from "@/lib/data/paaSchema";
import { PHQ9, GAD7, CSSRS_LITE } from "@/lib/data/screeners";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "acmd:paa:draft:v1";

type Yn3Props = {
  value: YesNoMaybe;
  onChange: (v: YesNoMaybe) => void;
  withUnknown?: boolean;
};

function Yn3({ value, onChange, withUnknown = true }: Yn3Props) {
  const options: YesNoMaybe[] = withUnknown
    ? ["no", "yes", "unknown"]
    : ["no", "yes"];
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition ${
            value === o
              ? o === "yes"
                ? "border-[var(--error)]/50 bg-[var(--error)]/[0.10] text-[var(--error-soft)]"
                : o === "unknown"
                  ? "border-[var(--warning)]/50 bg-[var(--warning)]/[0.10] text-[var(--warning)]"
                  : "border-[var(--success)]/50 bg-[var(--success)]/[0.10] text-[var(--success)]"
              : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
          }`}
        >
          {o === "unknown" ? "Unsure" : o}
        </button>
      ))}
    </div>
  );
}

function Pills({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly { v: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`rounded-full border px-3 py-1 text-[11px] tracking-[0.04em] transition ${
            value === o.v
              ? "border-[var(--violet)]/60 bg-[var(--violet)]/[0.10] text-white"
              : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function AssessmentShell() {
  const [state, setState] = useState<PaaState>(() => blankPaa());
  const [sectionIdx, setSectionIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PaaState;
        setState({ ...blankPaa(), ...parsed });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change
  useEffect(() => {
    if (state.status === "submitted") return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, lastUpdated: Date.now() })
      );
    } catch {}
  }, [state]);

  const update = <K extends keyof PaaState>(key: K, value: PaaState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const updateSymptom = (k: string, v: boolean) =>
    setState((s) => ({ ...s, symptoms: { ...s.symptoms, [k]: v } }));

  const updateCondition = (k: string, v: boolean) =>
    setState((s) => ({ ...s, conditions: { ...s.conditions, [k]: v } }));

  const updateSubstance = (
    name: string,
    field: keyof PaaState["substances"][string],
    v: string
  ) =>
    setState((s) => ({
      ...s,
      substances: {
        ...s.substances,
        [name]: { ...(s.substances[name] ?? {}), [field]: v },
      },
    }));

  const flags = useMemo(() => deriveFlags(state), [state]);

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "paa.submit",
          payload: { assessment: state, recipients: { clinicalDir: "" } },
        }),
      });
      const j = (await res.json()) as
        | {
            ok: true;
            assessmentId: string;
            redactedSummary: string;
            redactionCount: number;
          }
        | { ok: false; error: string };
      if (j.ok) {
        setState((s) => ({
          ...s,
          status: "submitted",
          submittedAt: Date.now(),
          redactedSummary: j.redactedSummary,
          redactionCount: j.redactionCount,
        }));
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      } else {
        setSubmitError(j.error);
      }
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    if (!confirm("Clear this assessment and start fresh?")) return;
    setState(blankPaa());
    setSectionIdx(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const sectionId = PAA_SECTIONS[sectionIdx].id;

  // Submitted view: show handoff card with redacted summary
  if (state.status === "submitted") {
    return (
      <div className="space-y-6">
        <Card variant="aurora" className="border-[var(--success)]/30">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <Badge tone="success">Submitted</Badge>
              <h2
                className="font-display mt-2 text-2xl text-white"
                style={{ fontVariationSettings: "'opsz' 96" }}
              >
                Assessment routed for clinical review
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-2)]">
                {state.redactionCount ?? 0} PHI items redacted on submit. Raw
                PHI never persists. Audit row written.
              </p>
            </div>
            <Button variant="ghost" onClick={reset}>
              Start new assessment
            </Button>
          </div>
        </Card>

        <HandoffCard state={state} flags={flags} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section nav */}
      <Card variant="flat" className="overflow-x-auto">
        <div className="flex gap-1.5">
          {PAA_SECTIONS.map((s, i) => {
            const active = i === sectionIdx;
            const isSafety = s.id === "safety";
            const hasFlags = isSafety && flags.length > 0;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSectionIdx(i)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1 rounded-lg border px-3 py-2 text-[10px] uppercase tracking-[0.08em] transition",
                  active
                    ? "border-[var(--violet)]/60 bg-[var(--violet)]/[0.08] text-white"
                    : "border-white/[0.06] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
                )}
              >
                <span className="font-display text-base leading-none">
                  {s.glyph}
                </span>
                <span className="text-[10px] whitespace-nowrap">{s.label}</span>
                {hasFlags && (
                  <span className="font-mono text-[9px] text-[var(--error-soft)]">
                    {flags.length} flag{flags.length === 1 ? "" : "s"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Section content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {sectionId === "demo" && (
            <Card variant="aurora" className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Caller name</Label>
                  <Input
                    id="name"
                    value={state.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">DOB</Label>
                  <Input
                    id="dob"
                    placeholder="MM/DD/YYYY"
                    value={state.dob}
                    onChange={(e) => update("dob", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={state.age}
                    onChange={(e) => update("age", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sex">Sex assigned at birth</Label>
                  <Input
                    id="sex"
                    value={state.sex}
                    onChange={(e) => update("sex", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender identity</Label>
                  <Input
                    id="gender"
                    value={state.gender}
                    onChange={(e) => update("gender", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={state.occupation}
                    onChange={(e) => update("occupation", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address (city, state minimum)</Label>
                  <Input
                    id="address"
                    value={state.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Preferred contact</Label>
                  <Pills
                    value={state.preferredContact}
                    options={[
                      { v: "phone", label: "Phone" },
                      { v: "text", label: "Text" },
                      { v: "email", label: "Email" },
                    ]}
                    onChange={(v) =>
                      update("preferredContact", v as PaaState["preferredContact"])
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="contactValue">Contact value</Label>
                  <Input
                    id="contactValue"
                    value={state.contactValue}
                    onChange={(e) => update("contactValue", e.target.value)}
                  />
                </div>
              </div>
            </Card>
          )}

          {sectionId === "presenting" && (
            <Card variant="aurora" className="space-y-4">
              <div>
                <Label htmlFor="presenting">Presenting problem (caller's words)</Label>
                <Textarea
                  id="presenting"
                  rows={3}
                  value={state.presentingFactor}
                  onChange={(e) => update("presentingFactor", e.target.value)}
                  placeholder="What brings them in today? Use their language."
                />
              </div>
              <div>
                <Label>Symptoms reported</Label>
                <div className="flex flex-wrap gap-1.5">
                  {PAA_SYMPTOMS.map((sym) => {
                    const on = !!state.symptoms[sym];
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => updateSymptom(sym, !on)}
                        className={`rounded-full border px-3 py-1 text-[11px] transition ${
                          on
                            ? "border-[var(--violet)]/60 bg-[var(--violet)]/[0.10] text-white"
                            : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label htmlFor="symptomsOther">Other symptoms not listed</Label>
                <Input
                  id="symptomsOther"
                  value={state.symptomsOther}
                  onChange={(e) => update("symptomsOther", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
                <div>
                  <Label>Trauma history</Label>
                  <Yn3
                    value={state.traumaYN}
                    onChange={(v) => update("traumaYN", v)}
                  />
                </div>
                {state.traumaYN !== "no" && (
                  <div>
                    <Label htmlFor="traumaDetail">Detail (trauma-informed)</Label>
                    <Textarea
                      id="traumaDetail"
                      rows={2}
                      value={state.traumaDetail}
                      onChange={(e) => update("traumaDetail", e.target.value)}
                      placeholder="Capture what they're willing to share — no need to re-traumatize."
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {sectionId === "substance" && (
            <Card variant="aurora" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Substance use (last 30 days)</Label>
                <button
                  type="button"
                  onClick={() =>
                    update("substancesNone", !state.substancesNone)
                  }
                  className={`rounded-full border px-3 py-1 text-[11px] transition ${
                    state.substancesNone
                      ? "border-[var(--success)]/60 bg-[var(--success)]/[0.10] text-[var(--success)]"
                      : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
                  }`}
                >
                  Denies any substance use
                </button>
              </div>
              {!state.substancesNone && (
                <div className="space-y-2">
                  {PAA_SUBSTANCES.map((sub) => {
                    const row = state.substances[sub] ?? {};
                    const active =
                      row.frequency || row.lastUse || row.route || row.amount;
                    return (
                      <div
                        key={sub}
                        className={`rounded-xl border px-3 py-2 transition ${
                          active
                            ? "border-[var(--violet)]/40 bg-[var(--violet)]/[0.04]"
                            : "border-white/[0.06] bg-white/[0.015]"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="min-w-[110px] text-white">{sub}</span>
                          <input
                            placeholder="route"
                            value={row.route ?? ""}
                            onChange={(e) =>
                              updateSubstance(sub, "route", e.target.value)
                            }
                            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-xs text-[var(--ink-2)] outline-none focus:border-[var(--periwinkle)]/40"
                          />
                          <input
                            placeholder="freq"
                            value={row.frequency ?? ""}
                            onChange={(e) =>
                              updateSubstance(sub, "frequency", e.target.value)
                            }
                            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-xs text-[var(--ink-2)] outline-none focus:border-[var(--periwinkle)]/40"
                          />
                          <input
                            placeholder="amount"
                            value={row.amount ?? ""}
                            onChange={(e) =>
                              updateSubstance(sub, "amount", e.target.value)
                            }
                            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-xs text-[var(--ink-2)] outline-none focus:border-[var(--periwinkle)]/40"
                          />
                          <input
                            placeholder="last use"
                            value={row.lastUse ?? ""}
                            onChange={(e) =>
                              updateSubstance(sub, "lastUse", e.target.value)
                            }
                            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-xs text-[var(--ink-2)] outline-none focus:border-[var(--periwinkle)]/40"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div>
                <Label htmlFor="otherDrugs">Other substances not listed</Label>
                <Input
                  id="otherDrugs"
                  value={state.otherDrugs}
                  onChange={(e) => update("otherDrugs", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="detoxHx">Detox / withdrawal history</Label>
                  <Textarea
                    id="detoxHx"
                    rows={3}
                    value={state.detoxHx}
                    onChange={(e) => update("detoxHx", e.target.value)}
                    placeholder="Prior detoxes, complications, seizure history, DTs?"
                  />
                </div>
                <div>
                  <Label>Anticipated withdrawal risk</Label>
                  <Pills
                    value={state.withdrawalRisk}
                    options={[
                      { v: "none", label: "None" },
                      { v: "mild", label: "Mild" },
                      { v: "moderate", label: "Moderate" },
                      { v: "severe", label: "Severe" },
                    ]}
                    onChange={(v) =>
                      update("withdrawalRisk", v as PaaState["withdrawalRisk"])
                    }
                  />
                  <p className="mt-1 text-[10px] text-[var(--ink-4)]">
                    Severe = medically monitored detox required (ASAM 3.7+)
                  </p>
                </div>
              </div>
            </Card>
          )}

          {sectionId === "safety" && (
            <div className="space-y-4">
              <Screener
                def={PHQ9}
                responses={state.phq9}
                onChange={(r) => update("phq9", r)}
              />
              <Screener
                def={GAD7}
                responses={state.gad7}
                onChange={(r) => update("gad7", r)}
              />
              <Screener
                def={CSSRS_LITE}
                responses={state.cssrs}
                onChange={(r) => update("cssrs", r)}
              />
              <Card variant="aurora" className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>History of self-harm</Label>
                    <Yn3
                      value={state.selfHarmHx}
                      onChange={(v) => update("selfHarmHx", v)}
                    />
                  </div>
                  <div>
                    <Label>Active HI</Label>
                    <Yn3
                      value={state.hiCurrent}
                      onChange={(v) => update("hiCurrent", v)}
                    />
                  </div>
                  <div>
                    <Label>Past HI</Label>
                    <Yn3
                      value={state.hiPast}
                      onChange={(v) => update("hiPast", v)}
                    />
                  </div>
                </div>
                {(state.selfHarmHx === "yes" ||
                  state.hiCurrent === "yes" ||
                  state.hiPast === "yes") && (
                  <div>
                    <Label htmlFor="hiDetail">Safety detail</Label>
                    <Textarea
                      id="hiDetail"
                      rows={3}
                      value={state.hiDetail}
                      onChange={(e) => update("hiDetail", e.target.value)}
                      placeholder="Target / means / timeframe if HI. Description if self-harm."
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="safetyPlan">Safety plan / supports</Label>
                  <Textarea
                    id="safetyPlan"
                    rows={2}
                    value={state.safetyPlan}
                    onChange={(e) => update("safetyPlan", e.target.value)}
                    placeholder="What's keeping them safe between now and intake? Who can they call?"
                  />
                </div>
              </Card>
            </div>
          )}

          {sectionId === "legal" && (
            <Card variant="aurora" className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
                <div>
                  <Label htmlFor="legalIssues">Legal issues</Label>
                  <Textarea
                    id="legalIssues"
                    rows={2}
                    value={state.legalIssues}
                    onChange={(e) => update("legalIssues", e.target.value)}
                    placeholder="Open charges, court mandates, DV/restraining orders, immigration"
                  />
                </div>
                <div>
                  <Label>Probation / parole</Label>
                  <Yn3
                    value={state.probationOrParole}
                    onChange={(v) => update("probationOrParole", v)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
                <div>
                  <Label>Violence history</Label>
                  <Yn3
                    value={state.violenceHx}
                    onChange={(v) => update("violenceHx", v)}
                  />
                </div>
                {state.violenceHx !== "no" && (
                  <div>
                    <Label htmlFor="violenceDetail">Violence detail</Label>
                    <Textarea
                      id="violenceDetail"
                      rows={2}
                      value={state.violenceDetail}
                      onChange={(e) => update("violenceDetail", e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="primaryDx">Primary diagnosis (clinician-confirmed)</Label>
                  <Input
                    id="primaryDx"
                    value={state.primaryDx}
                    onChange={(e) => update("primaryDx", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mhDx">Other MH / SUD diagnoses</Label>
                  <Input
                    id="mhDx"
                    value={state.mhDx}
                    onChange={(e) => update("mhDx", e.target.value)}
                  />
                </div>
              </div>
            </Card>
          )}

          {sectionId === "asd" && (
            <Card variant="aurora" className="space-y-4">
              <div>
                <Label>ASD screen (6 questions, 0–3 each)</Label>
                <div className="space-y-2">
                  {PAA_ASD_QS.map((q, i) => {
                    const v = state.asdScores[i] ?? 0;
                    return (
                      <div
                        key={i}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2"
                      >
                        <p className="text-sm text-[var(--ink-2)]">{q}</p>
                        <div className="mt-2 flex gap-1">
                          {[0, 1, 2, 3].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const next = [...state.asdScores];
                                next[i] = n;
                                update("asdScores", next);
                              }}
                              className={`flex-1 rounded-md border py-1 text-xs transition ${
                                v === n
                                  ? n >= 2
                                    ? "border-[var(--warning)]/60 bg-[var(--warning)]/[0.10] text-[var(--warning)]"
                                    : "border-[var(--violet)]/60 bg-[var(--violet)]/[0.10] text-white"
                                  : "border-white/[0.06] bg-white/[0.02] text-[var(--ink-3)]"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-[11px] text-[var(--ink-3)]">
                  Total:{" "}
                  <span className="font-mono text-white">
                    {state.asdScores.reduce((a, b) => a + b, 0)}
                  </span>{" "}
                  / 18 — escalation routes via Clinical Director, never categorical exclusion.
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label>IDD present</Label>
                  <Yn3
                    value={state.iddPresent}
                    onChange={(v) => update("iddPresent", v)}
                  />
                </div>
                <div>
                  <Label>Open with Regional Center</Label>
                  <Yn3
                    value={state.regionalCenter}
                    onChange={(v) => update("regionalCenter", v)}
                  />
                </div>
                <div>
                  <Label>Conservatorship</Label>
                  <Pills
                    value={state.conservatorship}
                    options={[
                      { v: "none", label: "None" },
                      { v: "self", label: "Self" },
                      { v: "lps", label: "LPS" },
                      { v: "probate", label: "Probate" },
                      { v: "unknown", label: "Unsure" },
                    ]}
                    onChange={(v) =>
                      update(
                        "conservatorship",
                        v as PaaState["conservatorship"]
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="conservatorContact">
                    Conservator / guardian contact
                  </Label>
                  <Input
                    id="conservatorContact"
                    value={state.conservatorContact}
                    onChange={(e) =>
                      update("conservatorContact", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="asdNote">Clinical note</Label>
                <Textarea
                  id="asdNote"
                  rows={2}
                  value={state.asdNote}
                  onChange={(e) => update("asdNote", e.target.value)}
                  placeholder="Sensory needs, communication preferences, accommodations required"
                />
              </div>
            </Card>
          )}

          {sectionId === "txhx" && (
            <Card variant="aurora" className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="psychHospCount">
                    Psychiatric hospitalizations (count)
                  </Label>
                  <Input
                    id="psychHospCount"
                    value={state.psychHospCount}
                    onChange={(e) => update("psychHospCount", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="psychHospLast">Most recent hospitalization</Label>
                  <Input
                    id="psychHospLast"
                    placeholder="MM/YYYY + facility if known"
                    value={state.psychHospLast}
                    onChange={(e) => update("psychHospLast", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mhProgramsPrior">Prior MH treatment programs</Label>
                <Textarea
                  id="mhProgramsPrior"
                  rows={3}
                  value={state.mhProgramsPrior}
                  onChange={(e) => update("mhProgramsPrior", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="saProgramsPrior">Prior SUD treatment programs</Label>
                <Textarea
                  id="saProgramsPrior"
                  rows={3}
                  value={state.saProgramsPrior}
                  onChange={(e) => update("saProgramsPrior", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pastTxOutcomes">
                  What worked / didn&apos;t work in past treatment
                </Label>
                <Textarea
                  id="pastTxOutcomes"
                  rows={3}
                  value={state.pastTxOutcomes}
                  onChange={(e) => update("pastTxOutcomes", e.target.value)}
                  placeholder="Use this to differentiate this admit from the last one"
                />
              </div>
            </Card>
          )}

          {sectionId === "medical" && (
            <Card variant="aurora" className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label>Allergies</Label>
                  <Pills
                    value={state.allergies}
                    options={[
                      { v: "nka", label: "NKA" },
                      { v: "yes", label: "Has allergies" },
                    ]}
                    onChange={(v) =>
                      update("allergies", v as PaaState["allergies"])
                    }
                  />
                  {state.allergies === "yes" && (
                    <Input
                      className="mt-2"
                      placeholder="List allergies + reactions"
                      value={state.allergyDetail}
                      onChange={(e) => update("allergyDetail", e.target.value)}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="heightWeight">Height / weight</Label>
                  <Input
                    id="heightWeight"
                    value={state.heightWeight}
                    onChange={(e) => update("heightWeight", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="medications">Current medications</Label>
                <Textarea
                  id="medications"
                  rows={2}
                  value={state.medications}
                  onChange={(e) => update("medications", e.target.value)}
                  placeholder="Name / dose / frequency"
                />
              </div>
              <div>
                <Label htmlFor="medsBringing">What they&apos;ll bring to intake</Label>
                <Textarea
                  id="medsBringing"
                  rows={2}
                  value={state.medsBringing}
                  onChange={(e) => update("medsBringing", e.target.value)}
                  placeholder="Pharmacy bottles, written list, none"
                />
              </div>
              <div>
                <Label>Medical conditions</Label>
                <div className="flex flex-wrap gap-1.5">
                  {MEDICAL_CONDITIONS.map((c) => {
                    const on = !!state.conditions[c.id];
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => updateCondition(c.id, !on)}
                        className={`rounded-full border px-3 py-1 text-[11px] transition ${
                          on
                            ? "border-[var(--warning)]/60 bg-[var(--warning)]/[0.10] text-[var(--warning)]"
                            : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label htmlFor="conditionsDetail">Condition detail / current management</Label>
                <Textarea
                  id="conditionsDetail"
                  rows={2}
                  value={state.conditionsDetail}
                  onChange={(e) => update("conditionsDetail", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mobilityNeeds">Mobility / ADL needs</Label>
                <Input
                  id="mobilityNeeds"
                  value={state.mobilityNeeds}
                  onChange={(e) => update("mobilityNeeds", e.target.value)}
                  placeholder="Stairs, transfers, assistive devices"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
                <div>
                  <Label>Immediate medical concern</Label>
                  <Yn3
                    value={state.immediateMedical}
                    onChange={(v) => update("immediateMedical", v)}
                    withUnknown={false}
                  />
                </div>
                {state.immediateMedical === "yes" && (
                  <div>
                    <Label htmlFor="immediateMedicalDetail">Detail</Label>
                    <Input
                      id="immediateMedicalDetail"
                      value={state.immediateMedicalDetail}
                      onChange={(e) =>
                        update("immediateMedicalDetail", e.target.value)
                      }
                      placeholder="If yes, route to medical/911 before continuing intake"
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {sectionId === "environment" && (
            <Card variant="aurora" className="space-y-4">
              <div>
                <Label htmlFor="livingSituation">Current living situation</Label>
                <Textarea
                  id="livingSituation"
                  rows={2}
                  value={state.livingSituation}
                  onChange={(e) => update("livingSituation", e.target.value)}
                  placeholder="Housed / unstably housed / unhoused. Who else lives there."
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
                <div>
                  <Label>Social support</Label>
                  <Yn3
                    value={state.socialSupport}
                    onChange={(v) => update("socialSupport", v)}
                  />
                </div>
                <div>
                  <Label htmlFor="socialSupportDetail">Who supports them</Label>
                  <Input
                    id="socialSupportDetail"
                    value={state.socialSupportDetail}
                    onChange={(e) =>
                      update("socialSupportDetail", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label>Employed</Label>
                  <Yn3
                    value={state.employed}
                    onChange={(v) => update("employed", v)}
                  />
                </div>
                <div>
                  <Label>In school</Label>
                  <Yn3
                    value={state.inSchool}
                    onChange={(v) => update("inSchool", v)}
                  />
                </div>
              </div>
              {state.inSchool !== "no" && (
                <div>
                  <Label htmlFor="schoolDetail">School / academic context</Label>
                  <Input
                    id="schoolDetail"
                    value={state.schoolDetail}
                    onChange={(e) => update("schoolDetail", e.target.value)}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="treatmentGoals">Treatment goals (their words)</Label>
                <Textarea
                  id="treatmentGoals"
                  rows={3}
                  value={state.treatmentGoals}
                  onChange={(e) => update("treatmentGoals", e.target.value)}
                  placeholder="What does success look like for them in 30 / 60 / 90 days?"
                />
              </div>
            </Card>
          )}

          {sectionId === "admin" && (
            <div className="space-y-4">
              <Card variant="aurora" className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>Client type</Label>
                    <Pills
                      value={state.clientType}
                      options={[
                        { v: "new", label: "New" },
                        { v: "returning", label: "Returning" },
                      ]}
                      onChange={(v) =>
                        update("clientType", v as PaaState["clientType"])
                      }
                    />
                  </div>
                  <div>
                    <Label>Payment type</Label>
                    <Pills
                      value={state.paymentType}
                      options={[
                        { v: "insurance", label: "Insurance" },
                        { v: "self-pay", label: "Self-pay" },
                        { v: "scholarship", label: "Scholarship" },
                        { v: "other", label: "Other" },
                      ]}
                      onChange={(v) =>
                        update("paymentType", v as PaaState["paymentType"])
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="comingFrom">Coming from</Label>
                    <Input
                      id="comingFrom"
                      value={state.comingFrom}
                      onChange={(e) => update("comingFrom", e.target.value)}
                      placeholder="Hospital, prior facility, home, court referral, etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-1.5 flex items-center justify-between">
                      <Label htmlFor="repNotes" className="mb-0">
                        Rep notes
                      </Label>
                      <VoiceMic
                        onAppend={(t) =>
                          update(
                            "repNotes",
                            state.repNotes +
                              (state.repNotes.endsWith(" ") || !state.repNotes
                                ? ""
                                : " ") +
                              t
                          )
                        }
                      />
                    </div>
                    <Textarea
                      id="repNotes"
                      rows={3}
                      value={state.repNotes}
                      onChange={(e) => update("repNotes", e.target.value)}
                      placeholder="What you need clinical to see that the form doesn't capture"
                    />
                  </div>
                </div>
              </Card>

              <Card variant="aurora" className="space-y-3 border-[var(--violet)]/40">
                <div className="overline">ASAM 6-dimension summary</div>
                <AsamScorer
                  scores={state.asam}
                  onChange={(asam) => update("asam", asam)}
                />
              </Card>

              <Card variant="aurora">
                <div className="overline mb-2">Submit for clinical review</div>
                <p className="text-sm text-[var(--ink-2)]">
                  PHI runs through DEID (name, DOB, address, phone, email,
                  identifiers) before it leaves this device. Only the redacted
                  summary persists. An audit row is written for every submit.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button onClick={submit} disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit (DEID + send)"}
                  </Button>
                  <Button variant="ghost" onClick={reset}>
                    Reset draft
                  </Button>
                </div>
                {submitError && (
                  <p className="mt-3 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/[0.06] px-3 py-2 text-xs text-[var(--error-soft)]">
                    {submitError}
                  </p>
                )}
              </Card>
            </div>
          )}

          {/* Nav footer */}
          <div className="flex items-center gap-2">
            <Button
              variant="utility"
              size="sm"
              onClick={() => setSectionIdx((i) => Math.max(0, i - 1))}
              disabled={sectionIdx === 0}
            >
              ← Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setSectionIdx((i) =>
                  Math.min(PAA_SECTIONS.length - 1, i + 1)
                )
              }
              disabled={sectionIdx === PAA_SECTIONS.length - 1}
            >
              Next →
            </Button>
            <div className="ml-auto text-[11px] uppercase tracking-[0.18em] text-[var(--ink-3)]">
              {sectionIdx + 1} / {PAA_SECTIONS.length} ·{" "}
              {PAA_SECTIONS[sectionIdx].label}
            </div>
          </div>
        </div>

        {/* Right rail: safety flags + quick handoff preview */}
        <aside className="space-y-4">
          <SafetyFlagsPanel state={state} />
          <Card variant="flat">
            <div className="overline mb-2">Draft</div>
            <div className="text-xs text-[var(--ink-3)]">
              Autosaves locally as you type. Submit redacts PHI and clears the
              draft.
            </div>
            <div className="mt-2 font-mono text-[10px] tabular-nums text-[var(--ink-4)]">
              last update:{" "}
              {new Date(state.lastUpdated).toLocaleTimeString()}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
