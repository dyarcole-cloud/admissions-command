"use client";

export type AiSettings = {
  apiKey: string;
  model: string;
  enabled: boolean;
};

export const DEFAULT_MODEL = "claude-opus-4-7";
const KEY = "acmd:ai:v1";

export const MODELS: Array<{ id: string; label: string; latency: string }> = [
  { id: "claude-opus-4-7", label: "Opus 4.7 (deepest reasoning)", latency: "slowest" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6 (balanced)", latency: "medium" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 (fastest)", latency: "fastest" },
];

export const DEFAULT_AI_SETTINGS: AiSettings = {
  apiKey: "",
  model: DEFAULT_MODEL,
  enabled: false,
};

export function readAi(): AiSettings {
  if (typeof window === "undefined") return DEFAULT_AI_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function writeAi(a: AiSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {}
}

/** Headers to pass to /api/invoke when AI is enabled. Key is per-request,
 *  forwarded server-side, never persisted by the server. */
export function aiHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const s = readAi();
  if (!s.enabled || !s.apiKey) return {};
  return {
    "x-anthropic-key": s.apiKey,
    "x-anthropic-model": s.model,
  };
}
