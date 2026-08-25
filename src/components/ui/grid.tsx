import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const gridVariants = cva("grid", {
  compoundVariants: [
    { class: "sm:grid-cols-2", cols: "2", from: "sm" },
    { class: "md:grid-cols-2", cols: "2", from: "md" },
    { class: "lg:grid-cols-2", cols: "2", from: "lg" },
    { class: "sm:grid-cols-3", cols: "3", from: "sm" },
    { class: "md:grid-cols-3", cols: "3", from: "md" },
    { class: "lg:grid-cols-3", cols: "3", from: "lg" },
  ],
  defaultVariants: {
    cols: "1",
    from: "md",
    gap: "default",
    split: "none",
  },
  variants: {
    cols: {
      "1": "",
      "2": "",
      "3": "",
    },
    from: {
      lg: "",
      md: "",
      sm: "",
    },
    gap: {
      default: "gap-4",
      loose: "gap-6",
      none: "",
      section: "gap-7",
      tight: "gap-3",
    },
    split: {
      hero: "lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.78fr)] lg:items-center",
      none: "",
      rail: "lg:grid-cols-[0.26fr_1fr] lg:gap-12",
      "sidebar-left": "lg:grid-cols-[0.7fr_1.3fr] lg:items-start",
    },
  },
});

const Grid = ({
  className,
  cols = "1",
  from = "md",
  gap = "default",
  split = "none",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof gridVariants>) => (
  <div
    className={cn(gridVariants({ cols, from, gap, split }), className)}
    data-cols={cols}
    data-slot="grid"
    data-split={split}
    {...props}
  />
);

export { Grid, gridVariants };
