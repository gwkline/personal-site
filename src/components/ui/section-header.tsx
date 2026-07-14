import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { Eyebrow } from "@/components/page-header";
import { cn } from "@/lib/utils";

const sectionTitleVariants = cva(
  "font-heading font-semibold tracking-[-0.035em] text-balance",
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        compact: "text-xl sm:text-2xl",
        default: "text-2xl sm:text-3xl",
        lg: "text-3xl sm:text-4xl",
      },
    },
  }
);

export const SectionHeader = ({
  action,
  description,
  eyebrow,
  id,
  size = "default",
  title,
}: {
  action?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  id?: string;
  title: React.ReactNode;
} & VariantProps<typeof sectionTitleVariants>) => (
  <header
    className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
    data-slot="section-header"
  >
    <div className="space-y-2">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className={cn(sectionTitleVariants({ size }))} id={id}>
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </header>
);

export { sectionTitleVariants };
