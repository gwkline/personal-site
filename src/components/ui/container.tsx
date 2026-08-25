import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full", {
  defaultVariants: {
    padding: "page",
    width: "shell",
  },
  variants: {
    padding: {
      gutter: "px-4 sm:px-6",
      none: "",
      page: "px-4 py-10 sm:px-6 sm:py-14",
    },
    width: {
      narrow: "max-w-article",
      shell: "max-w-page",
    },
  },
});

const Container = ({
  className,
  padding = "page",
  width = "shell",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof containerVariants>) => (
  <div
    className={cn(containerVariants({ padding, width }), className)}
    data-slot="container"
    {...props}
  />
);

export { Container, containerVariants };
