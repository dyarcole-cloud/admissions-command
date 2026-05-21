import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white",
      "placeholder:text-[var(--ink-4)]",
      "outline-none transition focus:border-[var(--periwinkle)]/40 focus:ring-2 focus:ring-[var(--violet)]/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white",
      "placeholder:text-[var(--ink-4)]",
      "outline-none transition focus:border-[var(--periwinkle)]/40 focus:ring-2 focus:ring-[var(--violet)]/20",
      "resize-y",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--ink-3)]",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";
