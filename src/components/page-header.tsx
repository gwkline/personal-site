import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const pageTitleVariants = cva(
  "font-heading font-semibold tracking-[-0.045em] text-balance",
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        default: "text-4xl sm:text-5xl",
        detail: "text-4xl sm:text-5xl md:text-6xl",
        lg: "text-5xl sm:text-6xl md:text-7xl",
      },
    },
  }
);

export const Eyebrow = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p
    className={cn(
      "font-mono text-[0.6875rem] font-medium text-primary uppercase tracking-[0.16em]",
      className
    )}
    data-slot="eyebrow"
  >
    {children}
  </p>
);

export const PageHeader = ({
  action,
  children,
  description,
  eyebrow,
  size = "default",
  title,
}: {
  action?: React.ReactNode;
  children?: React.ReactNode;
  description: string;
  eyebrow?: React.ReactNode;
  title: string;
} & VariantProps<typeof pageTitleVariants>) => (
  <>
    <header className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
      <div className="max-w-2xl space-y-5">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className={cn(pageTitleVariants({ size }))}>{title}</h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {description}
        </p>
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
    <Separator />
  </>
);

export { pageTitleVariants };
