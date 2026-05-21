"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  DEFAULT_ORG,
  readOrg,
  writeOrg,
  type ImportedPayor,
  type OrgSettings,
} from "@/lib/data/orgSettings";
import {
  DEFAULT_AI_SETTINGS,
  MODELS,
  readAi,
  writeAi,
  type AiSettings,
} from "@/lib/data/aiSettings";

export function SettingsClient() {
  const [org, setOrg] = useState<OrgSettings>(DEFAULT_ORG);
  const [ai, setAi] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<
    null | { ok: true; ms: number; model: string } | { ok: false; error: string }
  >(null);

  useEffect(() => {
    setOrg(readOrg());
    setAi(readAi());
  }, []);

  const updateAi = <K extends keyof AiSettings>(k: K, v: AiSettings[K]) =>
    setAi((s) => {
      const next = { ...s, [k]: v };
      writeAi(next);
      setSavedAt(Date.now());
      setAiTestResult(null);
      return next;
    });

  const testAi = async () => {
    setAiTesting(true);
    setAiTestResult(null);
    const start = Date.now();
    try {
      const r = await fetch("/api/invoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-anthropic-key": ai.apiKey,
          "x-anthropic-model": ai.model,
        },
        body: JSON.stringify({
          op: "advisor.coach",
          payload: {
            segment: 1,
            segmentName: "Rapid Rapport",
            payorName: null,
            payorLight: null,
            checklist: {},
            objection: null,
            userMessage: "Ping — just verifying the API key is live. Reply with a single sentence about Motivational Interviewing.",
            history: [],
          },
        }),
      });
      const j = await r.json();
      if (j.ok && j.source === "anthropic-byok") {
        setAiTestResult({
          ok: true,
          ms: Date.now() - start,
          model: j.model || ai.model,
        });
      } else {
        setAiTestResult({
          ok: false,
          error:
            j.error ||
            (j.source === "fallback"
              ? "Key was rejected by Anthropic — fallback served"
              : "Anthropic call was not made; check key + model"),
        });
      }
    } catch (e) {
      setAiTestResult({ ok: false, error: (e as Error).message });
    } finally {
      setAiTesting(false);
    }
  };

  const facilitiesText = useMemo(
    () => org.facilities.join(", "),
    [org.facilities]
  );

  const update = <K extends keyof OrgSettings>(k: K, v: OrgSettings[K]) => {
    setOrg((o) => {
      const next = { ...o, [k]: v };
      writeOrg(next);
      setSavedAt(Date.now());
      return next;
    });
  };

  const updateEsc = (
    k: keyof OrgSettings["escalation"],
    v: string
  ) => {
    setOrg((o) => {
      const next = { ...o, escalation: { ...o.escalation, [k]: v } };
      writeOrg(next);
      setSavedAt(Date.now());
      return next;
    });
  };

  const tryImport = () => {
    setImportError(null);
    if (!importText.trim()) return;
    try {
      const raw = importText.trim();
      let rows: Array<Record<string, unknown>> = [];
      if (raw.startsWith("[") || raw.startsWith("{")) {
        const parsed = JSON.parse(raw);
        rows = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        rows = parseCsv(raw);
      }
      const now = Date.now();
      const newPayors: ImportedPayor[] = rows
        .map((r, i) => {
          const name = String(
            r.name || r.parent || r.Payor || r["Payor (Parent)"] || "Unknown"
          );
          const plan = String(
            r.plan || r["Policy / Product Name"] || r.Plan || ""
          );
          const lightRaw = String(
            r.light || r["Traffic Light"] || "YELLOW"
          ).toUpperCase();
          const light = (
            lightRaw.includes("RED")
              ? "RED"
              : lightRaw.includes("GREEN")
                ? "GREEN"
                : "YELLOW"
          ) as ImportedPayor["light"];
          return {
            id: `${now}-${i}`,
            name,
            plan,
            light,
            source: "import",
            importedAt: now,
          };
        })
        .filter((p) => p.name && p.name !== "Unknown");
      if (newPayors.length === 0) {
        setImportError("Couldn't find any usable rows. Need at least a name + plan column or JSON object with those fields.");
        return;
      }
      update("importedPayors", [...org.importedPayors, ...newPayors]);
      setImportText("");
    } catch (e) {
      setImportError(`Couldn't parse: ${(e as Error).message}`);
    }
  };

  const exportPayors = () => {
    const blob = new Blob(
      [JSON.stringify(org.importedPayors, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admissions-command-payors-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const removeImported = (id: string) =>
    update(
      "importedPayors",
      org.importedPayors.filter((p) => p.id !== id)
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card variant="aurora" className="space-y-4">
          <div>
            <div className="overline">Organization</div>
            <p className="mt-0.5 text-[11px] text-[var(--ink-4)]">
              Saved locally · syncs to tenant on auth
            </p>
          </div>
          <div>
            <Label htmlFor="orgName">Org name</Label>
            <Input
              id="orgName"
              value={org.orgName}
              onChange={(e) => update("orgName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="orgShort">Short / initials</Label>
            <Input
              id="orgShort"
              value={org.short}
              maxLength={6}
              onChange={(e) => update("short", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="orgFacilities">Facilities (comma-separated)</Label>
            <Input
              id="orgFacilities"
              value={facilitiesText}
              onChange={(e) =>
                update(
                  "facilities",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder="Main Campus, Detox, Outpatient"
            />
          </div>
        </Card>

        <Card variant="aurora" className="space-y-4">
          <div>
            <div className="overline">Escalation routes</div>
            <p className="mt-0.5 text-[11px] text-[var(--ink-4)]">
              Where Yellow / Red / safety routes go
            </p>
          </div>
          <div>
            <Label htmlFor="escClinical">Clinical Director email</Label>
            <Input
              id="escClinical"
              type="email"
              value={org.escalation.clinicalDir}
              onChange={(e) => updateEsc("clinicalDir", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="escMedical">Medical Director email</Label>
            <Input
              id="escMedical"
              type="email"
              value={org.escalation.medicalDir}
              onChange={(e) => updateEsc("medicalDir", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="escExec">Executive email</Label>
            <Input
              id="escExec"
              type="email"
              value={org.escalation.executive}
              onChange={(e) => updateEsc("executive", e.target.value)}
            />
          </div>
        </Card>
      </div>

      <Card variant="aurora" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="overline">AI Advisor — bring your own key</div>
            <p className="mt-0.5 text-[11px] text-[var(--ink-3)]">
              Drop in your Anthropic API key to switch the advisor from the
              built-in mock to real Claude. Key lives in localStorage on this
              device, sent server-side per request, never persisted.
            </p>
          </div>
          <Badge tone={ai.enabled && ai.apiKey ? "success" : "neutral"}>
            {ai.enabled && ai.apiKey ? "Live" : "Mock"}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="anthKey">Anthropic API key</Label>
            <Input
              id="anthKey"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="sk-ant-api03-…"
              value={ai.apiKey}
              onChange={(e) => updateAi("apiKey", e.target.value)}
            />
            <p className="mt-1 text-[10px] text-[var(--ink-4)]">
              console.anthropic.com → Settings → API Keys
            </p>
          </div>
          <div>
            <Label htmlFor="anthModel">Model</Label>
            <select
              id="anthModel"
              value={ai.model}
              onChange={(e) => updateAi("model", e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--periwinkle)]/40 focus:ring-2 focus:ring-[var(--violet)]/20"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[var(--bg-deep)]">
                  {m.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-[var(--ink-4)]">
              Opus for the hardest calls, Haiku for fast batch coaching
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => updateAi("enabled", !ai.enabled)}
            disabled={!ai.apiKey}
            className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition ${
              ai.enabled && ai.apiKey
                ? "border-[var(--success)]/60 bg-[var(--success)]/[0.10] text-[var(--success)]"
                : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-white/[0.18]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {ai.enabled ? "Enabled" : "Disabled"}
          </button>
          <Button
            size="sm"
            variant="utility"
            onClick={testAi}
            disabled={!ai.apiKey || aiTesting}
          >
            {aiTesting ? "Testing…" : "Test connection"}
          </Button>
          {aiTestResult && (
            <span
              className={`text-xs ${
                aiTestResult.ok
                  ? "text-[var(--success)]"
                  : "text-[var(--error-soft)]"
              }`}
            >
              {aiTestResult.ok
                ? `✓ ${aiTestResult.model} responded in ${aiTestResult.ms}ms`
                : `✗ ${aiTestResult.error}`}
            </span>
          )}
        </div>
        <p className="text-[10px] text-[var(--ink-4)]">
          When a Lambda + Bedrock backbone is configured (LAMBDA_INVOKE_URL on
          the server), it takes precedence over BYOK — tenants don't need their
          own keys. BYOK is the local-dev / pilot / "test before buying"
          mode.
        </p>
      </Card>

      <Card variant="aurora">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="overline">Payor import</div>
            <p className="mt-0.5 text-[11px] text-[var(--ink-3)]">
              CSV or JSON. Stored locally — when tenant Firestore syncing
              flips on, these merge into the 864-record master matrix.
            </p>
          </div>
          <Badge tone="neutral">{org.importedPayors.length} imported</Badge>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="paste">Paste rows</Label>
            <Textarea
              id="paste"
              rows={8}
              placeholder={`name,plan,light\nCigna PPO,MRC Tier 1,GREEN\nAetna,FCR MBB,YELLOW\n\n— or JSON —\n[{"name":"BCBS","plan":"PPO Choice","light":"GREEN"}]`}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="font-mono text-xs"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={tryImport} size="sm" disabled={!importText.trim()}>
                Import
              </Button>
              <Button
                onClick={exportPayors}
                size="sm"
                variant="ghost"
                disabled={org.importedPayors.length === 0}
              >
                Export JSON
              </Button>
              <Button
                onClick={() =>
                  update("importedPayors", [] as ImportedPayor[])
                }
                size="sm"
                variant="ghost"
                disabled={org.importedPayors.length === 0}
              >
                Clear all
              </Button>
            </div>
            {importError && (
              <p className="mt-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/[0.06] px-3 py-2 text-xs text-[var(--error-soft)]">
                {importError}
              </p>
            )}
          </div>
          <div>
            <Label>Imported so far</Label>
            <div className="max-h-[280px] space-y-1.5 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.015] p-2">
              {org.importedPayors.length === 0 ? (
                <p className="px-2 py-1 text-xs text-[var(--ink-3)]">
                  Nothing imported yet.
                </p>
              ) : (
                org.importedPayors.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-white">{p.plan || p.name}</div>
                      <div className="truncate text-[var(--ink-3)]">{p.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={p.light}>{p.light}</Badge>
                      <button
                        type="button"
                        onClick={() => removeImported(p.id)}
                        className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-[var(--error-soft)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {savedAt && (
        <div className="text-right font-mono text-[10px] tabular-nums text-[var(--ink-4)]">
          saved {new Date(savedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(/,|\t/).map((s) => s.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(/,|\t/).map((s) => s.trim());
    const row: Record<string, string> = {};
    header.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
}
