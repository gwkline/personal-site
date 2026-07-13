import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const pageTitleVariants = cva("tracking-tight", {
  defaultVariants: {
    size: "default",
  },
  variants: {
    size: {
      default: "text-4xl md:text-5xl",
      lg: "text-5xl md:text-6xl",
    },
  },
});

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
    <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
      <div className="max-w-2xl space-y-4">
        {eyebrow ? (
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {eyebrow}
          </p>
        ) : null}
        <h1 className={cn(pageTitleVariants({ size }))}>{title}</h1>
        <p className="text-lg text-muted-foreground">{description}</p>
        {children}
      </div>
      {action}
    </header>
    <Separator />
  </>
);
