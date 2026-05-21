"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { VoiceMic } from "@/components/app/VoiceMic";
import type { Light } from "@/lib/utils";

export type AdvisorContext = {
  segment: number;
  segmentName: string;
  payorName: string | null;
  payorLight: Light | null;
  checklist: Record<string, boolean>;
  objection: string | null;
  alerts?: string[];
  asamMaxDim?: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AdvisorChat({ context }: { context: AdvisorContext }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I'm here. Tell me what's happening on the call — or just describe the caller — and I'll coach you in real time.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || busy) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "advisor.coach",
          payload: {
            ...context,
            userMessage: trimmed,
            history: next.slice(-8),
          },
        }),
      });
      const json = (await res.json()) as { ok: boolean; text?: string; error?: string };
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: json.ok
            ? (json.text ?? "(no response)")
            : `[advisor unavailable — ${json.error ?? "unknown error"}]`,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `[advisor unreachable — ${(e as Error).message}]`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        ref={scrollRef}
        className="min-h-[200px] flex-1 space-y-3 overflow-y-auto pr-1"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === "assistant"
                ? "border border-white/[0.06] bg-white/[0.02] text-[var(--ink-2)]"
                : "ml-auto bg-[var(--violet)]/[0.14] text-white"
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-[var(--ink-3)]">
            <span className="inline-flex items-center gap-1">
              <span className="size-1 animate-pulse rounded-full bg-[var(--periwinkle)]" />
              <span
                className="size-1 animate-pulse rounded-full bg-[var(--periwinkle)]"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="size-1 animate-pulse rounded-full bg-[var(--periwinkle)]"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-3">
        <Textarea
          rows={2}
          placeholder={`Ask about ${context.segmentName.toLowerCase()}, or paste what the caller just said…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <VoiceMic onAppend={(t) => setInput((s) => s + (s.endsWith(" ") || !s ? "" : " ") + t)} />
            <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-4)]">
              ⌘/Ctrl + Enter to send
            </div>
          </div>
          <Button size="sm" onClick={send} disabled={busy || !input.trim()}>
            {busy ? "Thinking…" : "Send"}
          </Button>
        </div>
      </div>
    </>
  );
}
