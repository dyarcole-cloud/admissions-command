import * as React from "react";
import { cn } from "@/lib/utils";
import type { Light } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "violet" | "copper" | "success" | "warning" | "error" | Light;
};

const TONE_MAP: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-white/[0.06] text-[var(--ink-2)] border-white/10",
  violet: "bg-[var(--violet)]/15 text-[var(--violet)] border-[var(--violet)]/30",
  copper:
    "bg-[var(--copper)]/15 text-[var(--copper-bright)] border-[var(--copper)]/30",
  success:
    "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  warning:
    "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
  error: "bg-[var(--error)]/15 text-[var(--error-soft)] border-[var(--error)]/30",
  GREEN:
    "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  YELLOW:
    "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
  RED: "bg-[var(--error)]/15 text-[var(--error-soft)] border-[var(--error)]/30",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em]",
        TONE_MAP[tone],
        className
      )}
      {...props}
    />
  );
}
