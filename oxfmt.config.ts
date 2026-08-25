import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "**/src/routeTree.gen.ts",
    "**/convex/_generated/**",
    "**/src/styles.css",
    // Generated at build time; formatting would break the sha256 digests
    // published in the agent-skills index.
    "public/**",
  ],
});
