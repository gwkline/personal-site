# Gym tracker — architecture

## Stack (matches the site, nothing new)

TanStack Start route → React components → Convex tables/functions. Tailwind v4 tokens only (see AGENTS.md style-hygiene gate). Recharts via the existing `src/components/ui/chart.tsx` primitives. Zero new npm dependencies.

## File layout

```
src/routes/gym.tsx                 route + head meta (75-hard pattern)
src/components/gym/
  gym-page.tsx                     layout, useQuery(api.gym.get)
  today-hero.tsx                  today card, week strip, streak
  plan-board.tsx                  7-day grid, owner edit dialogs
  session-logger.tsx              log/edit a session
  load-chart.tsx                  the training-load chart
  goal-panel.tsx                  goal bars + owner CRUD
  coach-panel.tsx                 "today" + "adjust plan" (owner only)
src/lib/gym/
  types.ts                        shared plan/session/goal types
  seed.ts                         starter plan + demo history constants
  progression.ts                  deterministic overload engine + tests
  metrics.ts                      goal metrics + weekly aggregation + tests
  format.ts                       date/week helpers (timezone-aware)
convex/schema.ts                   + gymPlans, gymSessions, gymGoals,
                                   gymCoachLogs, gymSettings
convex/gym.ts                     queries/mutations (owner-gated writes)
convex/gymCoach.ts                LLM actions (today, adjustPlan)
convex/gymLlm.ts                  fetch-based opencode-go client + retry
convex/http.ts                    + GET /api/gym/nudge-status
scripts/gym-nudge.ts              accountability nudge (texting path)
```

## Convex function surface

Public (auth-checked where noted):

| Function | Kind | Gate |
| --- | --- | --- |
| `gym.get` | query | public read: plan, sessions (last 120), goals, settings-flag-only, isOwner |
| `gym.upsertPlanDay` | mutation | owner — edit one day of the active plan (creates new version) |
| `gym.renamePlan` | mutation | owner |
| `gym.applyPlanDraft` | mutation | owner — full-plan replace from validated draft (coach or manual) |
| `gym.logSession` / `gym.deleteSession` | mutation | owner |
| `gym.upsertGoal` / `gym.deleteGoal` | mutation | owner |
| `gym.setNudge` | mutation | owner — flips `nudgeEnabled`, sets time/number |
| `gym.seedDemoData` | mutation | owner — starter plan + 3 weeks of demo sessions + goals |
| `gymCoach.today` | action | owner — "what should I do today" |
| `gymCoach.adjustPlan` | action | owner — draft + explanation, never writes |
| internal `gym.getCoachContext` | query | owner check inside action context |

The owner gate is the existing `convex/lib/owner.ts` (`OWNER_EMAIL` env vs Better Auth session), the same mechanism the 75 Hard tracker uses.

## LLM integration (opencode-go / GLM-5.3)

**Reference studied:** `gwkline/plantry` (private) integrates LLMs two ways — (a) `@convex-dev/agent` + ai-sdk for its multi-turn chat, and (b) direct OpenAI-compatible calls from `"use node"` actions with JSON response formats, a retry wrapper, and a request-log table (`convex/ingest/ai.ts`). The gym tracker uses pattern (b), slimmed: single-shot JSON calls from a plain Convex action (no node runtime needed — `fetch` is available in actions, so no `openai` package and no new dependency).

**Endpoint contract** (verified against the live service):

- Base URL `https://opencode.ai/zen/go/v1` (OpenAI-compatible `/chat/completions`), override with `LLM_BASE_URL`.
- Model `glm-5.3`, override with `LLM_MODEL`.
- Auth: `Authorization: Bearer $OPENCODE_GO_API_KEY`.
- **Required routing header:** `x-opencode-session: <id>`. Calls without it fail with `MissingSessionID`. The client sends `gym-coach-<ts>`.
- `response_format: {"type": "json_object"}` is supported; responses still get defensively parsed and retried once with an error hint, plantry-style.
- GLM-5.3 is a reasoning model; reasoning tokens are billed but not returned in `content`. Costs land on the Go subscription allowance.

**Prompt shape (today):** system prompt carries the athlete profile (ex-D1 lacrosse, regular runner, exercise-induced asthma — inhaler on intensity work, warm-up ramps before tempo/intervals), the overtraining rules (≥1 rest day, hard-day alternation, ≤10% weekly run-volume growth), and the JSON output contract. User content carries the active plan's day for today, the last 14 days of sessions with RPE, open goals, and today's date. Output: `{ headline, session: {…plan-day shape}, reasoning, notes }`.

**Prompt shape (adjust):** same profile block, the full active plan, the instruction ("drop Thursday's run, I have a late work day"), recent sessions, and the deterministic progression suggestions computed by `src/lib/gym/progression.ts`. Output: `{ plan: <7 days, same shape as gymPlans.days>, changes: [{ summary, before, after }], explanation }`.

**Write path:** `adjustPlan` never persists the plan. The UI shows the diff and explanation; the owner's Apply click goes through `gym.applyPlanDraft`, which runs the same validators as manual edits and inserts a new version. Every call — success or error — lands in `gymCoachLogs` with prompt, response, and token usage, so plan changes stay explainable after the fact.

**Env vars** (added to `.env.example`): `OPENCODE_GO_API_KEY` (required for coach), `LLM_BASE_URL`, `LLM_MODEL` (optional overrides). Convex deployment env, not Vite env — the key never reaches the browser: `bunx convex env set OPENCODE_GO_API_KEY <key>`.

## Progressive overload engine

`src/lib/gym/progression.ts` is pure and unit-tested:

- An item is "cleared" when every set in its latest session hits ≥ repMax at ≥ target weight → suggest `targetWeightKg + incrementKg` (default 2.5).
- Two consecutive missed sessions on a day, or session RPE ≥ 9 twice in a row → suggest a hold or −5–10% reset (deload signal).
- Weekly guard: flag a plan that stacks >3 hard days in a row, has no rest day, or puts more than 5 hard days in a week.

The LLM receives these suggestions as constraints in the adjust prompt; it composes and explains, the engine decides the mechanics.

## Accountability loop (flagged, off by default)

```
Hermes cron (Mac, not registered yet — issue #1 in roadmap)
  └─ bun scripts/gym-nudge.ts
       ├─ GET {GYM_NUDGE_URL}/api/gym/nudge-status   (Convex httpAction)
       │    → { enabled, date, plannedTitle, loggedToday, streak,
       │        weekSummary }                          (public read, like 75-hard)
       ├─ if !enabled or already logged → exit 0 silently
       └─ hermes send --to photon:+15714399249 "Gym: Push A still open…"
```

- The flag lives in `gymSettings.nudgeEnabled`; the endpoint reports it, so the script needs no local config to be safe.
- The texting path is the existing Photon sidecar (`hermes send --to photon:+15714399249`) — the same delivery route the daily briefing uses; iMessage remains the reply channel.
- Why a Mac-side script instead of a Convex cron: texting only works from the `hermes` CLI path; Convex can't reach it. Convex owns state; the Mac owns delivery. The HTTP endpoint is the seam between them.
- Reply ingestion (text back "done, 5k easy" → session logged) is a deliberate post-MVP issue, not MVP scope.

## Local development

```sh
bun install
bunx convex env set OPENCODE_GO_API_KEY <key>   # once; coach only
bun run dev                                     # http://localhost:3000
```

Sign in (Better Auth — Google or email), with the dev deployment's `OWNER_EMAIL` matching your signed-in email to unlock editing, logging, coach, and seeding. Visitors get the read-only dashboard. First owner visit: **Load demo data** seeds the starter plan, 3 weeks of sessions, and two goals so the dashboard has something to show.

## Testing

- Unit (`bun run test`, vitest): progression engine, weekly aggregation, metric computations, plan validators — pure functions in `src/lib/gym`.
- E2E (`bun run test:e2e`): `/gym` joins `SITE_PAGES` (page-health matrix); a gym spec asserts hero, plan grid, chart, and goals render for the anonymous visitor and the owner-only affordances stay hidden.
- Full `bun run check` gates lint, types, and style hygiene before push.
