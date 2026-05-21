"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchIcd10, type Icd10Code } from "@/lib/data/icd10";

type Props = {
  /** Comma-separated current value (legacy free-text + codes interleaved). */
  value: string;
  onChange: (next: string) => void;
  label?: string;
  placeholder?: string;
};

export function Icd10Picker({ value, onChange, label = "Diagnoses (ICD-10)", placeholder = "GAD, F33, alcohol withdrawal…" }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchIcd10(query, 8), [query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const addCode = (c: Icd10Code) => {
    const tag = `${c.code} — ${c.description}`;
    if (value.includes(c.code)) {
      setQuery("");
      setOpen(false);
      return;
    }
    const sep = value && !value.trimEnd().endsWith(",") ? ", " : value ? " " : "";
    onChange(`${value}${sep}${tag}`);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref}>
      <Label htmlFor="icd10-picker">{label}</Label>
      <Input
        id="icd10-picker"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      {open && results.length > 0 && (
        <ul className="mt-1 max-h-72 overflow-y-auto rounded-xl border border-white/[0.06] bg-[var(--bg-deep)]/95 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          {results.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addCode(c)}
                className="flex w-full items-center justify-between gap-3 border-b border-white/[0.04] px-3 py-2 text-left text-sm transition last:border-0 hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <div className="font-mono text-[12px] tabular-nums text-[var(--periwinkle)]">
                    {c.code}
                  </div>
                  <div className="truncate text-[13px] text-[var(--ink-2)]">
                    {c.description}
                  </div>
                </div>
                <Badge tone="violet">{c.category}</Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
      {value && (
        <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs leading-relaxed text-[var(--ink-2)]">
          {value}
        </div>
      )}
      <p className="mt-1 text-[10px] text-[var(--ink-4)]">
        Type a code (F32) or term (PTSD, alcohol). Curated BH set — confirm in
        chart before submission.
      </p>
    </div>
  );
}
