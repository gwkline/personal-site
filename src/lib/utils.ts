import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Custom theme scales from styles.css must join their conflict groups or
 * tailwind-merge treats them as unknown classes and drops real conflicts.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["micro", "nano", "pico", "femto"] }],
      "max-w": [{ "max-w": ["page", "article"] }],
      tracking: [{ tracking: ["label", "tag", "eyebrow"] }],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
