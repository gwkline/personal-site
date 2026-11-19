# Gym tracker — product spec

Status: MVP spec, landed 2026-11-19. Route: `/gym`.

## User

Gavin — former D1 lacrosse athlete, regular runner, exercise-induced asthma
(carries an inhaler). Wants a structured weekly program that keeps strength
work and running in balance without overtraining. Trains at a commercial gym
(barbells, dumbbells, machines) and runs outside in NYC.

Not a fitness newbie app. No onboarding wizard, no "learn to squat" content.
It's a training log and a coach that speaks athlete.

## Jobs to be done

1. **See my week at a glance.** What's planned today, did I do it, how does
   this week compare to last week. One screen, visual, no digging.
2. **Manage the program.** A weekly template: which days are lift days, which
   are runs, which are rest. Per session: exercises, sets, reps, target
   weight. Editable, versioned.
3. **Log what I actually did.** Fast, per-exercise: weight × reps per set,
   distance/time for runs, an RPE, a note ("asthma flared on intervals").
4. **Ask the coach.** "What should I do today?" answers with today's session
   adapted to reality (missed Monday, heavy legs yesterday, weather).
5. **Adjust the plan with reasons.** The LLM proposes a revised weekly plan
   plus a change list ("front squat 4×8 → 4×6 at +2.5 kg because you cleared
   the top of the range two weeks running"). Nothing applies without review.
6. **Track goals.** Strength targets (back squat 140 kg × 3), run targets
   (50 km week), consistency targets (5 sessions/week, 6-week streak). Bars,
   not tables.
7. **Stay honest.** A daily text nudge on the existing texting path if a
   session is still unlogged by evening. Off by default.

## Product principles

- **Visual-first.** The dashboard answers "how am I doing" before you read a
  word. Chart before table, color before text.
- **The plan is a contract.** One active weekly plan. Every change — manual
  or LLM — creates a new version with a written reason. History is never
  destroyed.
- **LLM proposes, human disposes.** The coach never writes to the plan
  directly. It returns a draft plus an explanation; the owner applies it.
  Every call is logged with prompt, response, and token usage.
- **Coach inside guardrails.** Progressive overload suggestions come from a
  deterministic engine; the LLM composes context and explanation around
  them. Constraints (rest days, volume caps, asthma notes) are enforced in
  code, restated in the system prompt.
- **Public read, owner edit.** Same trust model as the 75 Hard tracker.
- **Ship small.** MVP is one page, one chart, three tables that matter, one
  LLM endpoint pair. Everything else is filed as issues.

## MVP scope

| Area | In scope |
| --- | --- |
| Plan CRUD | Weekly template with 7 days; lift/run/rest session kinds; per-item sets, rep range, target weight, duration/distance for runs; add/remove/edit days and items; versioned applies |
| Session logging | Log a session for a date: per-exercise sets (weight × reps), run distance/duration, RPE, notes |
| Chart | One training-load chart: weekly lift volume (kg, bars) vs run distance (km, line) |
| Goals | Create goals with metric/target/deadline; progress computed from sessions; progress bars on dashboard |
| Coach — today | Action endpoint + UI: "what should I do today" with reasoning, grounded in plan + last 14 days of logs |
| Coach — adjust | Action endpoint + UI: natural-language plan adjustment → draft plan + change list + explanation → owner applies |
| Demo data | Owner-gated seed: starter plan (balanced lifting + running), exercise catalog, 3 weeks of demo sessions, 2 goals |
| Accountability | Settings flag (off) + public status endpoint + `scripts/gym-nudge.ts` texting via `hermes send --to photon:+15714399249`; cron registration filed as an issue |
| Docs | This spec set in `docs/gym/` |

Explicitly out of MVP: multi-turn chat, exercise history charts, PR tables,
photo logs, two-way text check-in parsing, cron registration, production
deploy. All filed in [04-roadmap.md](./04-roadmap.md).

## Page layout (one route, `/gym`)

```
┌──────────────────────────────────────────────────────────┐
│ TODAY            Thu 19 Nov — Push A · not logged yet      │
│ [hero: session card, week strip Mon..Sun, streak, flag]   │
├──────────────────────────────────────────────────────────┤
│ THIS WEEK'S PLAN  [grid of 7 day cards, owner: edit]      │
├──────────────────────────────────────────────────────────┤
│ TRAINING LOAD     [chart: weekly volume bars + km line]   │
├──────────────────────────────────────────────────────────┤
│ GOALS             [progress bars with pace vs deadline]    │
├──────────────────────────────────────────────────────────┤
│ COACH             [what's today · adjust plan (owner)]     │
└──────────────────────────────────────────────────────────┘
```

Owner-only surfaces (plan editing, session logging, coach, goal editing,
nudge flag) hide for visitors; the read-only dashboard stays public.
