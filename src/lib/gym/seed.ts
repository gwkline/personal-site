/** Starter plan and demo history for the gym tracker. Pure and deterministic
 * so the seed mutation and unit tests share one source of truth. */

import { addDaysIso, getDayOfWeek } from "./format";
import type { GymSession, PlanDay } from "./types";

const ASTHMA_RUN_NOTE =
  "Carry inhaler. 10-min easy warm-up ramp before the hard block.";

export const STARTER_PLAN_NAME = "Base week — run/lift balance";

export const STARTER_PLAN_DAYS: PlanDay[] = [
  {
    dayOfWeek: 0,
    items: [
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Bench Press",
        notes: null,
        repMax: 8,
        repMin: 6,
        sets: 4,
        targetWeightKg: 80,
      },
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Overhead Press",
        notes: null,
        repMax: 8,
        repMin: 6,
        sets: 3,
        targetWeightKg: 47.5,
      },
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Incline Dumbbell Press",
        notes: null,
        repMax: 12,
        repMin: 10,
        sets: 3,
        targetWeightKg: 30,
      },
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Dips",
        notes: null,
        repMax: 12,
        repMin: 8,
        sets: 3,
        targetWeightKg: 0,
      },
    ],
    kind: "lift",
    title: "Push A — heavy",
  },
  {
    dayOfWeek: 1,
    items: [
      {
        distanceKm: 5,
        durationMin: 30,
        incrementKg: null,
        intensity: "easy",
        name: "Easy run",
        notes: "Conversational pace. Zone 2.",
        repMax: null,
        repMin: null,
        sets: null,
        targetWeightKg: null,
      },
    ],
    kind: "run",
    title: "Easy 5k",
  },
  {
    dayOfWeek: 2,
    items: [
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Deadlift",
        notes: null,
        repMax: 5,
        repMin: 3,
        sets: 4,
        targetWeightKg: 120,
      },
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Barbell Row",
        notes: null,
        repMax: 8,
        repMin: 6,
        sets: 4,
        targetWeightKg: 70,
      },
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Pull-ups",
        notes: null,
        repMax: 10,
        repMin: 6,
        sets: 3,
        targetWeightKg: 0,
      },
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Face Pulls",
        notes: null,
        repMax: 15,
        repMin: 12,
        sets: 3,
        targetWeightKg: 25,
      },
    ],
    kind: "lift",
    title: "Pull A — heavy",
  },
  {
    dayOfWeek: 3,
    items: [
      {
        distanceKm: 6,
        durationMin: 32,
        incrementKg: null,
        intensity: "tempo",
        name: "Tempo run",
        notes: ASTHMA_RUN_NOTE,
        repMax: null,
        repMin: null,
        sets: null,
        targetWeightKg: null,
      },
    ],
    kind: "run",
    title: "Tempo 6k",
  },
  {
    dayOfWeek: 4,
    items: [
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Back Squat",
        notes: null,
        repMax: 8,
        repMin: 6,
        sets: 4,
        targetWeightKg: 100,
      },
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Romanian Deadlift",
        notes: null,
        repMax: 10,
        repMin: 8,
        sets: 3,
        targetWeightKg: 90,
      },
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Walking Lunges",
        notes: null,
        repMax: 12,
        repMin: 10,
        sets: 3,
        targetWeightKg: 20,
      },
      {
        distanceKm: null,
        durationMin: null,
        incrementKg: null,
        intensity: null,
        name: "Standing Calf Raise",
        notes: null,
        repMax: 15,
        repMin: 12,
        sets: 3,
        targetWeightKg: 60,
      },
    ],
    kind: "lift",
    title: "Legs A — heavy",
  },
  {
    dayOfWeek: 5,
    items: [
      {
        distanceKm: 10,
        durationMin: 55,
        incrementKg: null,
        intensity: "easy",
        name: "Long run",
        notes: "Steady, relaxed effort.",
        repMax: null,
        repMin: null,
        sets: null,
        targetWeightKg: null,
      },
    ],
    kind: "run",
    title: "Long easy 10k",
  },
  {
    dayOfWeek: 6,
    items: [],
    kind: "rest",
    title: "Rest",
  },
];

export const STARTER_GOALS = [
  {
    deadline: null,
    metric: "lift-e1rm:Back Squat",
    targetValue: 140,
    title: "Back squat 140 kg estimated 1RM",
    unit: "kg",
  },
  {
    deadline: null,
    metric: "weekly-run-km",
    targetValue: 50,
    title: "50 km running week",
    unit: "km",
  },
  {
    deadline: null,
    metric: "weekly-sessions",
    targetValue: 5,
    title: "Five sessions a week",
    unit: "sessions",
  },
] as const;

interface DemoLiftSpec {
  kg: number;
  name: string;
  reps: number;
  sets: number;
}

interface DemoSessionSpec {
  dateOffset: number;
  entries: { lift?: DemoLiftSpec; runKm?: number; runMin?: number }[];
  kind: "lift" | "run";
  rpe: number | null;
  skipped?: boolean;
  notes?: string;
  title: string;
}

/** 21 days of history ending yesterday. Deterministic: a cleared week, a
 * grinding week with an asthma flare, and a normal week with one skip. */
const DEMO_SESSION_SPECS: DemoSessionSpec[] = [
  {
    dateOffset: -20,
    entries: [
      { lift: { kg: 80, name: "Bench Press", reps: 8, sets: 4 } },
      { lift: { kg: 47.5, name: "Overhead Press", reps: 8, sets: 3 } },
    ],
    kind: "lift",
    rpe: 7,
    title: "Push A — heavy",
  },
  {
    dateOffset: -19,
    entries: [{ runKm: 5, runMin: 31 }],
    kind: "run",
    rpe: 4,
    title: "Easy 5k",
  },
  {
    dateOffset: -18,
    entries: [
      { lift: { kg: 120, name: "Deadlift", reps: 4, sets: 4 } },
      { lift: { kg: 70, name: "Barbell Row", reps: 8, sets: 4 } },
    ],
    kind: "lift",
    rpe: 8,
    title: "Pull A — heavy",
  },
  {
    dateOffset: -17,
    entries: [{ runKm: 6, runMin: 33 }],
    kind: "run",
    notes: "Legs heavy from deadlifts.",
    rpe: 7,
    title: "Tempo 6k",
  },
  {
    dateOffset: -16,
    entries: [
      { lift: { kg: 100, name: "Back Squat", reps: 8, sets: 4 } },
      { lift: { kg: 90, name: "Romanian Deadlift", reps: 10, sets: 3 } },
    ],
    kind: "lift",
    rpe: 8,
    title: "Legs A — heavy",
  },
  {
    dateOffset: -15,
    entries: [{ runKm: 10, runMin: 57 }],
    kind: "run",
    rpe: 5,
    title: "Long easy 10k",
  },
  {
    dateOffset: -13,
    entries: [
      { lift: { kg: 80, name: "Bench Press", reps: 7, sets: 4 } },
      { lift: { kg: 47.5, name: "Overhead Press", reps: 7, sets: 3 } },
    ],
    kind: "lift",
    rpe: 8,
    title: "Push A — heavy",
  },
  {
    dateOffset: -12,
    entries: [{ runKm: 5, runMin: 30 }],
    kind: "run",
    rpe: 4,
    title: "Easy 5k",
  },
  {
    dateOffset: -11,
    entries: [
      { lift: { kg: 120, name: "Deadlift", reps: 3, sets: 4 } },
      { lift: { kg: 70, name: "Barbell Row", reps: 7, sets: 4 } },
    ],
    kind: "lift",
    rpe: 9,
    title: "Pull A — heavy",
  },
  {
    dateOffset: -10,
    entries: [{ runKm: 6, runMin: 34 }],
    kind: "run",
    notes: "Asthma flared on the tempo block; cut it short.",
    rpe: 9,
    title: "Tempo 6k",
  },
  {
    dateOffset: -9,
    entries: [
      { lift: { kg: 97.5, name: "Back Squat", reps: 7, sets: 4 } },
      { lift: { kg: 87.5, name: "Romanian Deadlift", reps: 9, sets: 3 } },
    ],
    kind: "lift",
    rpe: 9,
    title: "Legs A — heavy",
  },
  {
    dateOffset: -8,
    entries: [{ runKm: 8, runMin: 46 }],
    kind: "run",
    rpe: 5,
    title: "Long easy 10k",
  },
  {
    dateOffset: -6,
    entries: [
      { lift: { kg: 82.5, name: "Bench Press", reps: 8, sets: 4 } },
      { lift: { kg: 50, name: "Overhead Press", reps: 8, sets: 3 } },
      { lift: { kg: 30, name: "Incline Dumbbell Press", reps: 11, sets: 3 } },
    ],
    kind: "lift",
    rpe: 7,
    title: "Push A — heavy",
  },
  {
    dateOffset: -5,
    entries: [{ runKm: 5, runMin: 29 }],
    kind: "run",
    rpe: 4,
    title: "Easy 5k",
  },
  {
    dateOffset: -4,
    entries: [
      { lift: { kg: 122.5, name: "Deadlift", reps: 4, sets: 4 } },
      { lift: { kg: 72.5, name: "Barbell Row", reps: 8, sets: 4 } },
      { lift: { kg: 25, name: "Face Pulls", reps: 15, sets: 3 } },
    ],
    kind: "lift",
    rpe: 7,
    title: "Pull A — heavy",
  },
  {
    dateOffset: -3,
    entries: [],
    kind: "run",
    rpe: null,
    skipped: true,
    title: "Tempo 6k",
  },
  {
    dateOffset: -2,
    entries: [
      { lift: { kg: 102.5, name: "Back Squat", reps: 8, sets: 4 } },
      { lift: { kg: 90, name: "Romanian Deadlift", reps: 10, sets: 3 } },
      { lift: { kg: 20, name: "Walking Lunges", reps: 12, sets: 3 } },
    ],
    kind: "lift",
    rpe: 7,
    title: "Legs A — heavy",
  },
  {
    dateOffset: -1,
    entries: [{ runKm: 11, runMin: 61 }],
    kind: "run",
    rpe: 5,
    title: "Long easy 10k",
  },
];

export const buildDemoSessions = (todayIso: string): GymSession[] =>
  DEMO_SESSION_SPECS.map((spec, index) => {
    const date = addDaysIso(todayIso, spec.dateOffset);
    const createdAt = Date.parse(`${date}T18:00:00Z`);
    return {
      _id: `demo-${index}`,
      date,
      dayOfWeek: getDayOfWeek(date),
      entries: spec.entries.map((entry) => {
        if (entry.lift) {
          return {
            distanceKm: null,
            durationMin: null,
            name: entry.lift.name,
            notes: null,
            sets: Array.from({ length: entry.lift.sets }, () => ({
              reps: entry.lift?.reps ?? null,
              weightKg: entry.lift?.kg ?? null,
            })),
          };
        }
        return {
          distanceKm: entry.runKm ?? null,
          durationMin: entry.runMin ?? null,
          name: "Run",
          notes: null,
          sets: [],
        };
      }),
      kind: spec.kind,
      notes: spec.notes ?? null,
      planVersion: 1,
      rpe: spec.rpe,
      skipped: spec.skipped ?? false,
      title: spec.title,
      updatedAt: createdAt,
    } satisfies GymSession;
  });
