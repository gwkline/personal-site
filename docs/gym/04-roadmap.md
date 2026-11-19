# Gym tracker — roadmap

Tracked in GitHub issues labeled `gym-tracker` on `gwkline/personal-site`. This doc is the source of truth for scope and order; issues carry the acceptance detail.

## MVP (this branch, `feat/gym-tracker`)

1. Spec + data model + architecture docs (`docs/gym/`).
2. Convex: five tables, plan CRUD (versioned), session logging, goal CRUD, settings, owner-gated seed.
3. UI: `/gym` dashboard — today hero, week grid, training-load chart, goals, coach panel.
4. Coach: `gymCoach.today` and `gymCoach.adjustPlan` against opencode-go/glm-5.3, audited in `gymCoachLogs`.
5. Accountability: nudge flag (off), `/api/gym/nudge-status`, nudge script.
6. Unit tests for the pure engine; e2e page health for `/gym`.
7. README + `.env.example` updates.

## Post-MVP (filed issues, in priority order)

### 1. Register the daily nudge cron + two-way check-in

Schedule `scripts/gym-nudge.ts` via the Hermes cron path (17:30 ET), then close the loop: parse a reply ("done — 5k easy + push A") into a session log via the Messages→agent ingestion path. Needs Gavin's explicit opt-in (it texts him daily); the flag stays off until then.

### 2. Progressive overload v2 in the UI

Surface engine suggestions after every logged session ("cleared 4×8 — bump to 92.5 kg next week?"), one-tap apply; auto-schedule deload weeks every 5th week when rolling RPE trends high.

### 3. Exercise catalog

Real `gymExercises` CRUD with muscle groups and equipment; item picker in plan editing; per-exercise history view.

### 4. Goals v2

Pace-to-deadline projections on goal bars (on track / behind), goal detail views, celebrate achieved goals on the dashboard.

### 5. Strength + run charts

Per-lift estimated-1RM lines (progressive PRs), run pace trends, bodyweight series if logged. Feeds the "very visual" principle with the second and third chart views.

### 6. Coach chat

Multi-turn thread with the plan-diff review inline — the plantry `@convex-dev/agent` pattern, streaming, with tool calls for plan edits. Replaces the single-shot adjust dialog when it lands.

### 7. Gym-floor mode (mobile/PWA)

Big-target set logging, offline-tolerant drafts, watch-your-phone-less interaction. Only worth it once daily logging is a habit.

### 8. Production deploy checklist

Set `OPENCODE_GO_API_KEY` on the prod Convex deployment, confirm `OWNER_EMAIL`, verify coach latency under prod load, flip the nudge flag, register the cron. Explicitly gated on review of the MVP PR — no production deploy before that sign-off.
