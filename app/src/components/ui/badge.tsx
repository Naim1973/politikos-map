import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/50",
  {
    variants: {
      variant: {
        default: "border-white/30 bg-white/10 text-white",
        secondary: "border-white/10 bg-white/5 text-white/70",
        outline: "border-white/20 text-white",
        CRITICAL: "border-red-500 bg-red-500/20 text-red-400",
        HIGH: "border-orange-500/60 bg-orange-500/15 text-orange-400",
        MEDIUM: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
        LOW: "border-white/20 bg-white/5 text-white/60",
        APPROVED: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
        PENDING: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
        REJECTED: "border-white/20 bg-white/5 text-white/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
