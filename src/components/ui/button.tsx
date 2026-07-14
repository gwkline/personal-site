import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-45 motion-reduce:transition-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default:
          "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-9",
        "icon-lg": "size-10",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
      },
      variant: {
        default:
          "border-primary/80 bg-primary text-primary-foreground shadow-[inset_0_1px_0_color-mix(in_oklch,white,transparent_70%),inset_0_-1px_0_color-mix(in_oklch,black,transparent_86%),var(--shadow-elevation-1)] hover:scale-[0.99] hover:bg-primary/90 hover:shadow-[inset_0_1px_0_color-mix(in_oklch,white,transparent_66%),inset_0_-1px_0_color-mix(in_oklch,black,transparent_84%),var(--shadow-elevation-2)] active:scale-[0.98] active:shadow-[inset_0_1px_2px_color-mix(in_oklch,black,transparent_82%)] motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        link: "h-auto rounded-none p-0 text-info shadow-none underline-offset-4 hover:text-info/80 hover:underline",
        outline:
          "border-border bg-card text-foreground shadow-elevation-1 hover:scale-[0.99] hover:border-foreground/20 hover:bg-muted/70 hover:shadow-elevation-2 aria-expanded:bg-muted aria-expanded:text-foreground active:scale-[0.98] active:shadow-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
        secondary:
          "border-border/70 bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground),transparent_94%)] hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
      },
    },
  }
);
const Button = ({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => (
  <ButtonPrimitive
    data-slot="button"
    className={cn(buttonVariants({ className, size, variant }))}
    {...props}
  />
);
export { Button, buttonVariants };
