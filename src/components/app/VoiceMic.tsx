"use client";

import { useVoiceDictation } from "./useVoiceDictation";

type Props = {
  onAppend: (text: string) => void;
  className?: string;
  size?: "sm" | "md";
};

export function VoiceMic({ onAppend, className, size = "sm" }: Props) {
  const { supported, listening, error, start, stop } = useVoiceDictation({
    onTranscript: (text, isFinal) => {
      if (isFinal) onAppend(text.trim() + " ");
    },
  });

  if (!supported) return null;

  const dim = size === "sm" ? "size-7 text-xs" : "size-9 text-sm";

  return (
    <button
      type="button"
      onClick={() => (listening ? stop() : start())}
      title={error ? `Voice: ${error}` : listening ? "Stop dictation" : "Dictate (voice)"}
      aria-label={listening ? "Stop voice dictation" : "Start voice dictation"}
      className={`relative inline-flex ${dim} items-center justify-center rounded-full border transition ${
        listening
          ? "border-[var(--error)]/60 bg-[var(--error)]/[0.12] text-[var(--error-soft)]"
          : "border-white/[0.08] bg-white/[0.02] text-[var(--ink-2)] hover:border-[var(--periwinkle)]/40 hover:text-white"
      } ${className ?? ""}`}
    >
      {listening && (
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--error)]/30" />
      )}
      <span aria-hidden="true" className="relative">🎙</span>
    </button>
  );
}
