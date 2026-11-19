# Gym tracker — data model

All tables live in `convex/schema.ts`, following the conventions of the existing tables (`hard75Challenges`, `comments`): flat docs, explicit indexes, no joins in the schema. No `userId` on rows — the app is single-owner like the 75 Hard tracker; writes are gated by `assertOwner` (see [03-architecture.md](./03-architecture.md)).

## Tables

### `gymPlans` — weekly plan templates, versioned

One plan with `active: true` at a time. Applying a change (manual edit or coach draft) inserts a new version and flips the old one to `active: false`. Nothing is ever mutated in place except `active`, `name`, and `updatedAt`.

```ts
{
  name: string,              // "Base week — run/lift balance"
  active: boolean,
  version: number,           // 1, 2, 3 … monotonic
  reason: string,            // why this version exists ("cleared 4×8 at 90 kg")
  createdAt: number,         // epoch ms
  updatedAt: number,
  days: [                     // exactly 7, dayOfWeek 0 = Monday … 6 = Sunday
    {
      dayOfWeek: number,
      kind: "lift" | "run" | "rest" | "cross-train",
      title: string,         // "Push A — heavy", "Easy 5k", "Rest"
      items: [
        {
          name: string,                  // denormalized, e.g. "Back Squat"
          sets: number | null,
          repMin: number | null,
          repMax: number | null,
          targetWeightKg: number | null,
          incrementKg: number | null,    // progression step, default 2.5
          durationMin: number | null,    // runs
          distanceKm: number | null,    // runs
          intensity: string | null,      // "easy" | "tempo" | "intervals" | "steady"
          notes: string | null,          // e.g. "carry inhaler; 10-min warm-up ramp"
        }
      ]
    }
  ]
}
```

Index: `by_active` on `["active"]` (read the active plan with `.unique()`).

### `gymSessions` — what actually happened

One doc per logged session (two-a-days are allowed: two docs, same date).

```ts
{
  date: string,              // "YYYY-MM-DD", owner's timezone (America/New_York)
  dayOfWeek: number,         // denormalized for chart grouping
  title: string,             // "Push A — heavy"
  kind: "lift" | "run" | "cross-train",
  planVersion: number | null, // plan the session came from, for audit
  entries: [
    {
      name: string,
      sets: [ { weightKg: number | null, reps: number | null } ],
      distanceKm: number | null,
      durationMin: number | null,
      notes: string | null,
    }
  ],
  rpe: number | null,         // 1–10 session RPE
  notes: string | null,       // "asthma flared on intervals"
  skipped: boolean,           // logged deliberately as skipped
  createdAt: number,
  updatedAt: number,
}
```

Indexes: `by_date` on `["date"]`, `by_created` on `["createdAt"]`.

### `gymGoals`

```ts
{
  title: string,             // "Back squat 140 kg × 3"
  metric: string,            // see metric registry in src/lib/gym/metrics.ts
  targetValue: number,
  unit: string,              // "kg" | "km" | "sessions"
  deadline: string | null,   // "YYYY-MM-DD"
  status: "active" | "achieved" | "retired",
  createdAt: number,
  updatedAt: number,
}
```

Metric registry (code, not data): `lift-e1rm:<exercise>` (best estimated 1RM from logged sets), `weekly-run-km` (rolling 7 days), `weekly-sessions` (rolling 7 days), `streak-weeks` (consecutive weeks ≥ target sessions). Progress is computed read-side from `gymSessions`; nothing is cached on the goal doc.

Indexes: `by_status` on `["status", "createdAt"]`.

### `gymCoachLogs` — every LLM call, audited

Mirrors plantry's `ai` request-log pattern, slimmed down.

```ts
{
  kind: "today" | "adjust",
  model: string,             // "glm-5.3"
  instruction: string | null,// user ask for adjust calls
  requestJson: string,       // full prompt messages
  responseJson: string | null,
  status: "success" | "error",
  errorMessage: string | null,
  attempt: number,
  promptTokens: number | null,
  completionTokens: number | null,
  createdAt: number,
}
```

Index: `by_created` on `["createdAt"]`.

### `gymSettings` — one doc

```ts
{
  key: "primary",            // singleton marker
  nudgeEnabled: boolean,     // accountability flag, ships false
  nudgeTime: string,         // "17:30" local — when the nudge script targets
  nudgeTo: string | null,    // "photon:+15714399249"
  timezone: string,          // "America/New_York"
  updatedAt: number,
}
```

## Validation rules (enforced in mutations, shared with the coach path)

- `days` is exactly 7, `dayOfWeek` values 0–6 with no duplicates.
- Lift items: `sets ≥ 1`, `repMin ≤ repMax`, both present when either is.
- Run items: `distanceKm > 0` or `durationMin > 0` (intensity optional).
- At least one `rest` day per plan (overtraining guard, hard rule).
- Weights in kg, rounded to 1.25 kg steps in the UI.

The same validators run on both the manual plan-edit mutation and the apply-coach-draft mutation, so LLM output can never write an invalid plan.

## Lifecycle

1. Owner clicks **Load demo data** (or edits anything) → starter plan inserted as version 1, `active: true`; demo sessions + goals seeded.
2. Every plan change → new `gymPlans` doc, version + 1, with `reason`; previous version keeps its data, `active: false`.
3. Session logs are append-only; editing rewrites the same doc (same date, same title key) and bumps `updatedAt`.
4. Coach calls never write plans; they log to `gymCoachLogs` and return drafts. Apply goes through the same mutation as manual edits.
