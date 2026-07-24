import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite-plus";

export default defineConfig(({ command, isPreview, mode }) => ({
  plugins:
    mode === "test"
      ? []
      : [
          devtools(),
          // TanStack Start owns dev SSR; Nitro packages and previews production output.
          ...(command === "build" || isPreview ? [nitro()] : []),
          tailwindcss(),
          tanstackStart(),
          viteReact(),
          ...(command === "build"
            ? [
                babel({
                  presets: [reactCompilerPreset()],
                }),
              ]
            : []),
        ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    watch: {
      ignored: [
        "**/.playwright-browsers/**",
        "**/test-results/**",
        "**/playwright-report/**",
        "**/e2e/**/*-snapshots/**",
      ],
      usePolling: process.env.VITE_USE_POLLING === "true",
    },
  },
  test: {
    exclude: ["e2e/**", "**/node_modules/**", "**/.git/**"],
  },
}));
