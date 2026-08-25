import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const monoLabelVariants = cva("font-mono font-medium uppercase", {
  defaultVariants: {
    size: "default",
    tone: "muted",
    tracking: "tag",
  },
  variants: {
    size: {
      "2xs": "text-pico",
      default: "text-micro",
      xs: "text-nano",
    },
    tone: {
      inherit: "",
      muted: "text-muted-foreground",
      primary: "text-primary",
    },
    tracking: {
      eyebrow: "tracking-eyebrow",
      label: "tracking-label",
      tag: "tracking-tag",
    },
  },
});

const MonoLabel = ({
  className,
  render,
  size = "default",
  tone = "muted",
  tracking = "tag",
  ...props
}: useRender.ComponentProps<"p"> & VariantProps<typeof monoLabelVariants>) =>
  useRender({
    defaultTagName: "p",
    props: mergeProps<"p">(
      {
        className: cn(monoLabelVariants({ size, tone, tracking }), className),
      },
      props
    ),
    render,
    state: {
      size,
      slot: "mono-label",
      tone,
      tracking,
    },
  });

export { MonoLabel, monoLabelVariants };
