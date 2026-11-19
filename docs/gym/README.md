# Gym tracker

A workout routine tracker with an LLM coach, live at `/gym`.

| Doc | What's in it |
| --- | --- |
| [01-product-spec.md](./01-product-spec.md) | Who it's for, what it does, MVP scope |
| [02-data-model.md](./02-data-model.md) | Convex tables, fields, lifecycle |
| [03-architecture.md](./03-architecture.md) | App structure, LLM integration, accountability loop, local dev |
| [04-roadmap.md](./04-roadmap.md) | MVP checklist and post-MVP issue breakdown |

## One-paragraph summary

The gym tracker manages a weekly training plan (lifting sessions plus runs), logs completed workouts, and tracks goals against them. A built-in coach — GLM-5.3 via the opencode-go subscription — answers "what should I do today", proposes plan adjustments, and explains every change in plain language. Progress is visual-first: one dashboard with a training-load chart, a week grid, and goal bars. A daily accountability nudge runs over the existing texting path, gated behind a settings flag that ships off.

## Facts that shape the design

- The user is a former D1 lacrosse player who still trains like an athlete: responds to structured programming, not hand-holding.
- He runs regularly and carries an inhaler (exercise-induced asthma). Hard running days need warm-up ramps and inhaler reminders baked into the plan, not bolted on.
- The plan must balance lifting and running without overtraining. The engine enforces hard/easy alternation and caps weekly run-volume growth; the LLM coaches within those rules.
- Like the 75 Hard tracker, data is public-read, owner-edit. Visitors see the dashboard; only the owner can edit the plan, log sessions, or talk to the coach.
