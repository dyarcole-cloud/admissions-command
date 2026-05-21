import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "aurora" | "flat" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      variant === "aurora"
        ? "card-aurora"
        : variant === "flat"
          ? "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur"
          : "rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent p-6 backdrop-blur transition hover:border-white/[0.14]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "font-display text-lg leading-tight text-white",
      className
    )}
    style={{ fontVariationSettings: "'opsz' 72" }}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-[var(--ink-3)]", className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-sm text-[var(--ink-2)]", className)} {...props} />
);
