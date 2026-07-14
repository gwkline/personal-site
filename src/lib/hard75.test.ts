import { describe, expect, it } from "vitest";

import type { ChallengeConfig, DailyProgress } from "./hard75";
import {
  buildChallengeDays,
  daysBetween,
  getChallengeStats,
  getDailyMileage,
  getTodayInTimezone,
  getWeeklyMileage,
} from "./hard75";

const challenge: ChallengeConfig = {
  endDate: "2026-09-25",
  slug: "the-long-run-2026",
  startDate: "2026-07-13",
  timezone: "America/New_York",
  title: "75 Hard",
  totalDays: 75,
};

const progressFor = (
  dayIndex: number,
  values: Partial<DailyProgress> = {}
): DailyProgress => ({
  date: `2026-07-${String(12 + dayIndex).padStart(2, "0")}`,
  dayIndex,
  diet: false,
  outdoors: false,
  progressPhoto: false,
  progressPhotoUrl: null,
  publicPhotoUrl: null,
  reading: false,
  updatedAt: 1,
  water: false,
  workoutOne: false,
  workoutTwo: false,
  ...values,
});

describe("buildChallengeDays", () => {
  it("builds the inclusive July 13 through September 25 challenge", () => {
    const days = buildChallengeDays(challenge, [], "2026-07-13");

    expect(days).toHaveLength(75);
    expect(days[0]?.date).toBe("2026-07-13");
    expect(days[74]?.date).toBe("2026-09-25");
    expect(days[0]?.isToday).toBe(true);
    expect(days[1]?.isFuture).toBe(true);
  });

  it("maps saved progress to the correct challenge day", () => {
    const days = buildChallengeDays(
      challenge,
      [progressFor(1, { diet: true, reading: true })],
      "2026-07-13"
    );

    expect(days[0]?.completedCount).toBe(2);
    expect(days[0]?.isComplete).toBe(false);
  });
});

describe("getChallengeStats", () => {
  it("counts partial work without requiring perfect days", () => {
    const days = buildChallengeDays(
      challenge,
      [
        progressFor(1, {
          diet: true,
          outdoors: true,
          progressPhoto: true,
          reading: true,
          water: true,
          workoutOne: true,
          workoutTwo: true,
        }),
        progressFor(2, { diet: true, runMiles: 4.2, workoutOne: true }),
      ],
      "2026-07-14"
    );
    const stats = getChallengeStats(days);

    expect(stats.perfectDays).toBe(1);
    expect(stats.completedRequirements).toBe(9);
    expect(stats.consistency).toBe(64);
    expect(stats.streak).toBe(1);
    expect(stats.totalMiles).toBe(4.2);
  });

  it("gives the mileage chart a baseline before week one", () => {
    const days = buildChallengeDays(
      challenge,
      [progressFor(1, { runMiles: 4.2 })],
      "2026-07-13"
    );

    expect(getWeeklyMileage(days).slice(0, 2)).toEqual([
      { miles: 0, week: "Start" },
      { miles: 4.2, week: "W1" },
    ]);
  });

  it("shows mileage for each elapsed day", () => {
    const days = buildChallengeDays(
      challenge,
      [progressFor(1, { runMiles: 4.2 }), progressFor(2, { runMiles: 3.1 })],
      "2026-07-14"
    );

    expect(getDailyMileage(days)).toEqual([
      { day: "Start", miles: 0 },
      { day: "D1", miles: 4.2 },
      { day: "D2", miles: 3.1 },
    ]);
  });
});

describe("date helpers", () => {
  it("uses the New York calendar day around UTC midnight", () => {
    const lateEvening = new Date("2026-07-14T02:30:00.000Z");

    expect(getTodayInTimezone("America/New_York", lateEvening)).toBe(
      "2026-07-13"
    );
  });

  it("reports the inclusive challenge as 74 elapsed intervals", () => {
    expect(daysBetween("2026-07-13", "2026-09-25")).toBe(74);
  });
});
