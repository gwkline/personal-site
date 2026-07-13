import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statVariants = cva("space-y-1", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "",
      panel: "rounded-lg bg-muted/50 p-3",
      surface: "rounded-lg bg-background/90 p-3 ring-1 ring-foreground/10",
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
    <p className="flex items-center justify-between gap-2 text-muted-foreground text-xs">
      {label}
      {icon}
    </p>
    <p className="font-mono text-2xl tabular-nums">{value}</p>
    {detail ? <p className="text-muted-foreground text-xs">{detail}</p> : null}
  </div>
);
