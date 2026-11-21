import { describe, expect, it } from "vitest";

import { addDaysIso } from "./format";
import { buildDemoSessions, STARTER_PLAN_DAYS } from "./seed";
import type { PlanDay } from "./types";
import { validatePlanDays } from "./validate";

const liftDay = (dayOfWeek: number): PlanDay => ({
  dayOfWeek,
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
  ],
  kind: "lift",
  title: "Legs",
});

const restDay = (dayOfWeek: number): PlanDay => ({
  dayOfWeek,
  items: [],
  kind: "rest",
  title: "Rest",
});

const fullWeek = (): PlanDay[] => [
  liftDay(0),
  liftDay(1),
  liftDay(2),
  liftDay(3),
  liftDay(4),
  liftDay(5),
  restDay(6),
];

describe("validatePlanDays", () => {
  it("accepts the starter plan", () => {
    expect(validatePlanDays(STARTER_PLAN_DAYS).valid).toBe(true);
  });

  it("requires seven days", () => {
    expect(validatePlanDays(fullWeek().slice(0, 6)).error).toBe(
      "Plan must have exactly 7 days"
    );
  });

  it("rejects duplicate weekdays", () => {
    const days = fullWeek();
    days[1] = liftDay(0);
    expect(validatePlanDays(days).error).toBe("Duplicate Monday entry");
  });

  it("requires a rest day", () => {
    const days = fullWeek();
    days[6] = liftDay(6);
    expect(validatePlanDays(days).error).toBe(
      "Plan needs at least one full rest day per week"
    );
  });

  it("rejects repMin above repMax", () => {
    const days = fullWeek();
    const [firstDay] = days;
    const [firstItem] = firstDay.items;
    if (!firstItem) {
      throw new Error("test fixture missing item");
    }
    firstItem.repMin = 10;
    expect(validatePlanDays(days).error).toBe(
      "Legs: Back Squat repMin cannot exceed repMax"
    );
  });

  it("requires distance, duration, or notes on run items", () => {
    const days = fullWeek();
    days[1] = {
      dayOfWeek: 1,
      items: [
        {
          distanceKm: null,
          durationMin: null,
          incrementKg: null,
          intensity: "easy",
          name: "Easy run",
          notes: null,
          repMax: null,
          repMin: null,
          sets: null,
          targetWeightKg: null,
        },
      ],
      kind: "run",
      title: "Easy 5k",
    };
    expect(validatePlanDays(days).error).toBe(
      "Easy 5k: run items need distance, duration, or notes"
    );
  });

  it("rejects zero-set lift items and empty exercise names", () => {
    const days = fullWeek();
    days[0].items[0].sets = 0;
    expect(validatePlanDays(days).error).toBe(
      "Legs: Back Squat needs at least 1 set"
    );
    const named = fullWeek();
    named[0].items[0].name = "  ";
    expect(validatePlanDays(named).error).toBe("Legs: empty exercise name");
  });
});

describe("buildDemoSessions", () => {
  it("builds deterministic history ending yesterday", () => {
    const today = "2026-11-19";
    const sessions = buildDemoSessions(today);
    expect(sessions).toHaveLength(18);
    expect(sessions.at(-1)?.date).toBe("2026-11-18");
    // Rebuilding on another "today" shifts every date but keeps shape.
    const shifted = buildDemoSessions(addDaysIso(today, 7));
    expect(shifted).toHaveLength(sessions.length);
    expect(shifted.at(-1)?.date).toBe(addDaysIso(today, 6));
  });

  it("marks the skipped tempo day and keeps run entries distance-based", () => {
    const sessions = buildDemoSessions("2026-11-19");
    const skipped = sessions.filter((session) => session.skipped);
    expect(skipped).toHaveLength(1);
    expect(skipped[0]?.title).toBe("Tempo 6k");
    const run = sessions.find(
      (session) => session.kind === "run" && !session.skipped
    );
    expect(run?.entries[0]?.distanceKm).toBeGreaterThan(0);
    expect(run?.entries[0]?.sets).toHaveLength(0);
  });
});
