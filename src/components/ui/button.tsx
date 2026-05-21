import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "btn-primary",
        ghost: "btn-ghost",
        utility:
          "rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[var(--ink-2)] hover:border-[var(--periwinkle)]/40 hover:text-white",
        destructive:
          "rounded-full border border-[var(--error)]/40 bg-transparent px-5 py-2.5 text-[var(--error)] hover:bg-[var(--error)]/10",
        link: "text-[var(--periwinkle)] underline-offset-4 hover:underline",
      },
      size: {
        default: "text-sm",
        sm: "text-xs px-3 py-1.5",
        lg: "text-base px-7 py-3.5",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
