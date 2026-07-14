import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statVariants = cva("space-y-1.5", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "",
      panel:
        "rounded-xl border border-transparent bg-muted/60 p-3.5 shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground),transparent_94%)]",
      surface:
        "rounded-xl border bg-card/90 p-3.5 shadow-elevation-1 backdrop-blur-sm",
    },
  },
});

export const Stat = ({
  className,
  detail,
  icon,
  label,
  value,
  variant = "default",
}: {
  className?: string;
  detail?: React.ReactNode;
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
} & VariantProps<typeof statVariants>) => (
  <div className={cn(statVariants({ variant }), className)} data-slot="stat">
    <p className="flex items-center justify-between gap-2 font-medium text-[0.6875rem] text-muted-foreground uppercase tracking-[0.08em]">
      {label}
      {icon}
    </p>
    <p className="font-mono text-2xl font-medium tracking-tight tabular-nums">
      {value}
    </p>
    {detail ? <p className="text-muted-foreground text-xs">{detail}</p> : null}
  </div>
);
