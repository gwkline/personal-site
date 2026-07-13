import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-sm text-card-foreground shadow-xs ring-1 ring-foreground/10 [--card-spacing:--spacing(6)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-card",
        muted: "bg-muted/30",
      },
    },
  }
);

const Card = ({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    size?: "default" | "sm";
  }) => (
  <div
    data-slot="card"
    data-size={size}
    data-variant={variant}
    className={cn(cardVariants({ variant }), className)}
    {...props}
  />
);
const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="card-header"
    className={cn(
      "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
      className
    )}
    {...props}
  />
);
const cardTitleVariants = cva("leading-normal", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "text-base font-medium group-data-[size=sm]/card:text-sm",
      display: "font-serif text-4xl font-normal tracking-tight sm:text-5xl",
      section: "font-serif text-2xl font-normal tracking-tight",
    },
  },
});

const CardTitle = ({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardTitleVariants>) => (
  <div
    data-slot="card-title"
    data-variant={variant}
    className={cn(cardTitleVariants({ variant }), className)}
    {...props}
  />
);

const cardDescriptionVariants = cva("text-muted-foreground", {
  defaultVariants: {
    size: "default",
  },
  variants: {
    size: {
      default: "text-sm",
      lg: "text-base leading-relaxed",
    },
  },
});

const CardDescription = ({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardDescriptionVariants>) => (
  <div
    data-slot="card-description"
    data-size={size}
    className={cn(cardDescriptionVariants({ size }), className)}
    {...props}
  />
);
const CardAction = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="card-action"
    className={cn(
      "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      className
    )}
    {...props}
  />
);
const CardContent = ({
  className,
  grow = false,
  ...props
}: React.ComponentProps<"div"> & {
  grow?: boolean;
}) => (
  <div
    data-slot="card-content"
    data-grow={grow}
    className={cn("px-(--card-spacing) data-[grow=true]:flex-1", className)}
    {...props}
  />
);
const CardFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="card-footer"
    className={cn(
      "flex items-center rounded-b-xl px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
      className
    )}
    {...props}
  />
);
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  cardTitleVariants,
  cardDescriptionVariants,
};
