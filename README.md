# Personal site

Gavin Kline's personal site, built with React, TanStack Start, Convex, and Tailwind CSS.

## Requirements

- [Bun](https://bun.sh/) 1.2.21 or newer
- A [Convex](https://www.convex.dev/) project for data and authentication

## Setup

Install dependencies:

```sh
bun install
```

Start the application and Convex development server:

```sh
bun run dev
```

The site is served at [http://localhost:3000](http://localhost:3000).

Convex creates the required local environment files during project setup. The application expects `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` when exercising data-backed or authentication routes. Set `OWNER_EMAIL` in the Convex deployment to the Better Auth email allowed to edit The Long Game tracker; all other visitors receive the public, read-only view.

## Scripts

- `bun run dev` — initialize Convex, then run Vite+ and Convex together
- `bun run build` — create the production build with Vite+
- `bun run serve` — preview the production build
- `bun run test` — run the Vite+ test suite once
- `bun run test:e2e` — Playwright responsive and functional checks
- `bun run test:e2e:full` — same suite across the full device matrix
- `bun run test:e2e:ui` — Playwright UI mode
- `bun run check` — run Ultracite and TypeScript checks
- `bun run fix` — apply Ultracite lint and formatting fixes
- `bun run typecheck` — run TypeScript without emitting files

## End-to-end checks

Playwright covers every user-facing route across a device matrix (desktop, iPhone 16 including a bottom-chrome Safari approximation, Android, iPad). Specs live in `e2e/` and assert:

- page load + shell (nav, main, title, viewport meta)
- no horizontal overflow / stuck visualViewport scale or offset
- mobile sheet navigation and nested scroll-container behavior

First-time setup:

```sh
bun run test:e2e:install
bun run test:e2e
```

If the app is already on port 3000, Playwright reuses it. In CI it starts `vp dev` unless `PW_WEB_SERVER_COMMAND` is set. Use `bun run test:e2e:full` for the expanded device list. Failed tests automatically capture screenshots.

**Note:** Playwright emulates device viewports (including an iPhone 16 “bottom chrome” project that shrinks height for Safari’s bottom search bar). It cannot fully reproduce real iOS visualViewport chrome; the suite still catches horizontal overflow, stuck scale/offset, and nested-scroll regressions that correlate with that class of bug.

## Tooling

[Vite+](https://viteplus.dev/) provides the development, build, preview, and test command surface. TanStack Start currently needs a version-controlled Bun patch when used with Vite+'s runnable development environment. The patch can be removed once `@tanstack/start-plugin-core` recognizes that environment without falling through to its 404 middleware.

[Ultracite](https://www.ultracite.ai/) supplies the shared code-quality presets, with [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) as the lint and format engines. Generated TanStack Router and Convex files are excluded in `oxlint.config.ts` and `oxfmt.config.ts`.

The repository includes Oxc settings for VS Code/Cursor and Zed. Install the official Oxc extension in either editor to enable formatting and safe lint fixes on save.
