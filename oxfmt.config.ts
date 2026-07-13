import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "**/src/routeTree.gen.ts",
    "**/convex/_generated/**",
    "**/src/styles.css",
  ],
});
