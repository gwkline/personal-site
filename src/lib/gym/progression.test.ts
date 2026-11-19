import { describe, expect, it } from "vitest";

import { addDaysIso } from "./format";
import { buildProgressionReport, hasRestDay } from "./progression";
import { buildDemoSessions, STARTER_PLAN_DAYS } from "./seed";
import type { GymSession, PlanDay } from "./types";

const today = "2026-11-19";

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

describe("buildProgressionReport", () => {
  it("suggests an increment when the latest session cleared the rep range", () => {
    const plan: PlanDay[] = STARTER_PLAN_DAYS;
    const sessions = [
      session({
        date: "2026-11-17",
        entries: [
          {
            distanceKm: null,
            durationMin: null,
            name: "Back Squat",
            notes: null,
            sets: [
              { reps: 8, weightKg: 100 },
              { reps: 8, weightKg: 100 },
              { reps: 8, weightKg: 100 },
              { reps: 8, weightKg: 100 },
            ],
          },
        ],
      }),
    ];
    const report = buildProgressionReport(plan, sessions, today);
    const squat = report.itemSuggestions.find(
      (item) => item.itemName === "Back Squat"
    );
    expect(squat).toBeDefined();
    expect(squat?.suggestedKg).toBe(102.5);
    expect(squat?.currentTargetKg).toBe(100);
    expect(squat?.reason).toContain("2026-11-17");
  });

  it("does not suggest when the last set fell short", () => {
    const sessions = [
      session({
        date: "2026-11-17",
        entries: [
          {
            distanceKm: null,
            durationMin: null,
            name: "Back Squat",
            notes: null,
            sets: [
              { reps: 8, weightKg: 100 },
              { reps: 7, weightKg: 100 },
            ],
          },
        ],
      }),
    ];
    const report = buildProgressionReport(STARTER_PLAN_DAYS, sessions, today);
    expect(report.itemSuggestions).toHaveLength(0);
  });

  it("ignores history outside the 14-day window", () => {
    const sessions = [
      session({
        date: addDaysIso(today, -20),
        entries: [
          {
            distanceKm: null,
            durationMin: null,
            name: "Back Squat",
            notes: null,
            sets: [{ reps: 8, weightKg: 100 }],
          },
        ],
      }),
    ];
    const report = buildProgressionReport(STARTER_PLAN_DAYS, sessions, today);
    expect(report.itemSuggestions).toHaveLength(0);
  });

  it("flags back-to-back RPE 9 sessions as a deload signal", () => {
    const sessions = [
      session({ date: "2026-11-17", rpe: 9 }),
      session({ date: "2026-11-16", rpe: 9 }),
    ];
    const report = buildProgressionReport(STARTER_PLAN_DAYS, sessions, today);
    const fatigueFlag = report.planFlags.find((flag) =>
      flag.summary.includes("RPE")
    );
    expect(fatigueFlag?.level).toBe("info");
  });

  it("does not flag the starter plan structure (hard/easy alternation holds)", () => {
    const report = buildProgressionReport(STARTER_PLAN_DAYS, [], today);
    const structural = report.planFlags.filter((flag) =>
      flag.summary.includes("in a row")
    );
    expect(structural).toHaveLength(0);
    expect(hasRestDay(STARTER_PLAN_DAYS)).toBe(true);
  });

  it("flags stacked hard days", () => {
    const days: PlanDay[] = STARTER_PLAN_DAYS.map((day) => ({ ...day }));
    // Turn Wednesday (2) into a second consecutive lift after Tuesday... Tuesday
    // is a run; convert Tuesday to intervals so Tue+Wed+Thu(tempo)+Fri stack.
    days[1] = {
      dayOfWeek: 1,
      items: [
        {
          distanceKm: 6,
          durationMin: 30,
          incrementKg: null,
          intensity: "intervals",
          name: "Intervals",
          notes: null,
          repMax: null,
          repMin: null,
          sets: null,
          targetWeightKg: null,
        },
      ],
      kind: "run",
      title: "Intervals 6k",
    };
    const report = buildProgressionReport(days, [], today);
    expect(
      report.planFlags.some((flag) =>
        flag.summary.includes("hard days in a row")
      )
    ).toBe(true);
  });

  it("sees the demo history's strong week without crashing", () => {
    const sessions = buildDemoSessions(today);
    const report = buildProgressionReport(STARTER_PLAN_DAYS, sessions, today);
    // Bench cleared 4×8 at 82.5 two days ago; squat cleared 4×8 at 102.5 yesterday.
    const names = report.itemSuggestions.map((item) => item.itemName);
    expect(names).toContain("Back Squat");
    expect(names).toContain("Bench Press");
  });
});
