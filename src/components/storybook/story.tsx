import { Eyebrow } from "@/components/page-header";
import { cn } from "@/lib/utils";

const StoryCanvas = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-xl border bg-surface-sunken/40 p-4 [background-image:radial-gradient(color-mix(in_oklch,var(--border)_75%,transparent)_1px,transparent_1px)] [background-size:14px_14px] sm:p-6",
      className
    )}
    data-slot="story-canvas"
  >
    {children}
  </div>
);

export const StorySection = ({
  children,
  className,
  description,
  id,
  name,
}: {
  children: React.ReactNode;
  className?: string;
  description?: string;
  id: string;
  name: string;
}) => (
  <section
    className={cn("scroll-mt-32 space-y-5", className)}
    data-slot="story-section"
    id={id}
  >
    <div className="space-y-1.5">
      <Eyebrow>{name}</Eyebrow>
      {description ? (
        <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
    <StoryCanvas>{children}</StoryCanvas>
  </section>
);

export const VariantGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3",
      className
    )}
    data-slot="variant-grid"
  >
    {children}
  </div>
);

export const Variant = ({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) => (
  <div
    className={cn("flex min-w-0 flex-col gap-2.5", className)}
    data-slot="variant"
  >
    <span className="font-mono text-nano text-muted-foreground uppercase tracking-[0.12em]">
      {label}
    </span>
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  </div>
);
