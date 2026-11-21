import { describe, expect, it } from "vitest";

import { addDaysIso, getDayOfWeek, getWeekStartIso } from "./format";
import {
  estimatedOneRepMax,
  goalProgress,
  sessionStreak,
  weeklyLoad,
} from "./metrics";
import { buildDemoSessions } from "./seed";
import type { GymSession } from "./types";

const session = (overrides: Partial<GymSession>): GymSession => ({
  _id: "s",
  date: "2026-11-18",
  dayOfWeek: 2,
  entries: [],
  kind: "lift",
  notes: null,
  planVersion: 1,
  rpe: null,
  skipped: false,
  title: "Session",
  updatedAt: 0,
  ...overrides,
});

describe("weeklyLoad", () => {
  it("buckets lift volume and run distance by Monday-start weeks", () => {
    // Thursday
    const today = "2026-11-19";
    const sessions = [
      session({
        // Monday, this week
        date: "2026-11-16",
        entries: [
          {
            distanceKm: null,
            durationMin: null,
            name: "Back Squat",
            notes: null,
            sets: [
              { reps: 8, weightKg: 100 },
              { reps: 8, weightKg: 100 },
            ],
          },
        ],
      }),
      session({
        date: "2026-11-18",
        entries: [
          {
            distanceKm: 10,
            durationMin: 55,
            name: "Long run",
            notes: null,
            sets: [],
          },
        ],
        kind: "run",
      }),
      session({
        // Monday, last week
        date: "2026-11-09",
        entries: [
          {
            distanceKm: null,
            durationMin: null,
            name: "Bench",
            notes: null,
            sets: [{ reps: 8, weightKg: 80 }],
          },
        ],
      }),
    ];
    const weeks = weeklyLoad(sessions, today, 2);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toMatchObject({
      liftVolumeKg: 640,
      runKm: 0,
      sessions: 1,
      weekStart: "2026-11-09",
    });
    expect(weeks[1]).toMatchObject({
      liftVolumeKg: 1600,
      runKm: 10,
      sessions: 2,
      weekStart: "2026-11-16",
    });
  });

  it("ignores skipped sessions", () => {
    const sessions = [
      session({ date: "2026-11-16", entries: [], skipped: true }),
    ];
    const weeks = weeklyLoad(sessions, "2026-11-19", 1);
    expect(weeks[0]?.sessions).toBe(0);
  });
});

describe("estimatedOneRepMax", () => {
  it("uses the Epley formula", () => {
    expect(estimatedOneRepMax(100, 8)).toBeCloseTo(126.7, 1);
    expect(estimatedOneRepMax(140, 1)).toBeCloseTo(144.7, 1);
  });
});

describe("goalProgress", () => {
  const today = "2026-11-19";
  const sessions = buildDemoSessions(today);

  it("computes best e1RM for lift goals from real logs", () => {
    const progress = goalProgress(
      { deadline: null, metric: "lift-e1rm:Back Squat", targetValue: 140 },
      sessions,
      today
    );
    // Best squat log: 102.5 × 8 → e1RM ≈ 129.8
    expect(progress.currentValue).toBeGreaterThan(125);
    expect(progress.currentValue).toBeLessThan(135);
    expect(progress.achieved).toBe(false);
    expect(progress.fraction).toBeGreaterThan(0.8);
  });

  it("counts rolling 7-day run km", () => {
    const progress = goalProgress(
      { deadline: null, metric: "weekly-run-km", targetValue: 50 },
      sessions,
      today
    );
    // Last 7 days: 5k (11-14) + 11k (11-18) = 16 km
    expect(progress.currentValue).toBe(16);
  });

  it("counts rolling 7-day sessions", () => {
    const progress = goalProgress(
      { deadline: null, metric: "weekly-sessions", targetValue: 5 },
      sessions,
      today
    );
    expect(progress.currentValue).toBeGreaterThanOrEqual(3);
  });

  it("flags achieved goals", () => {
    const progress = goalProgress(
      { deadline: null, metric: "weekly-sessions", targetValue: 1 },
      sessions,
      today
    );
    expect(progress.achieved).toBe(true);
    expect(progress.fraction).toBe(1);
  });

  it("marks pace against a deadline", () => {
    const behind = goalProgress(
      {
        deadline: addDaysIso(today, 20),
        metric: "weekly-run-km",
        targetValue: 500,
      },
      sessions,
      today
    );
    expect(behind.pace).toBe("behind");
    const ahead = goalProgress(
      {
        deadline: addDaysIso(today, 20),
        metric: "weekly-run-km",
        targetValue: 1,
      },
      sessions,
      today
    );
    expect(ahead.pace).toBe("on-track");
  });
});

describe("sessionStreak", () => {
  it("counts consecutive logged days ending today or yesterday", () => {
    const today = "2026-11-19";
    const sessions = [
      session({ date: today }),
      session({ date: "2026-11-18" }),
      session({ date: "2026-11-14" }),
    ];
    expect(sessionStreak(sessions, today)).toBe(2);
    // From tomorrow's view the streak survives through yesterday.
    expect(sessionStreak(sessions, addDaysIso(today, 1))).toBe(2);
    // Two days out with no log, the streak is gone.
    expect(sessionStreak(sessions, addDaysIso(today, 3))).toBe(0);
  });

  it("skipped days break the streak", () => {
    const today = "2026-11-19";
    const sessions = [
      session({ date: today }),
      session({ date: "2026-11-18", skipped: true }),
    ];
    expect(sessionStreak(sessions, today)).toBe(1);
  });
});

describe("format helpers", () => {
  it("treats Monday as day 0 and weeks start Monday", () => {
    // Monday
    expect(getDayOfWeek("2026-11-16")).toBe(0);
    // Sunday
    expect(getDayOfWeek("2026-11-22")).toBe(6);
    // Thu → Mon
    expect(getWeekStartIso("2026-11-19")).toBe("2026-11-16");
  });
});
