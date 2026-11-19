/** Read-side aggregations: weekly training load for the chart, goal progress. */

import { addDaysIso, diffDays, getWeekStartIso } from "./format";
import type { GymGoal, GymSession, LoggedSet } from "./types";

export interface WeekLoad {
  weekStart: string;
  liftVolumeKg: number;
  runKm: number;
  sessions: number;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

const entryVolumeKg = (sets: LoggedSet[]) =>
  sets.reduce((total, set) => total + (set.weightKg ?? 0) * (set.reps ?? 0), 0);

/** Weekly lift volume (kg) and run distance (km) for the last `weeks` weeks
 * ending on the week containing `todayIso`. Weeks run Monday–Sunday. */
export const weeklyLoad = (
  sessions: Pick<GymSession, "date" | "kind" | "skipped" | "entries">[],
  todayIso: string,
  weeks: number
): WeekLoad[] => {
  const thisWeekStart = getWeekStartIso(todayIso);
  const buckets = new Map<string, WeekLoad>();
  for (let index = weeks - 1; index >= 0; index -= 1) {
    const weekStart = addDaysIso(thisWeekStart, -7 * index);
    buckets.set(weekStart, {
      liftVolumeKg: 0,
      runKm: 0,
      sessions: 0,
      weekStart,
    });
  }
  for (const session of sessions) {
    if (session.skipped) {
      continue;
    }
    const bucket = buckets.get(getWeekStartIso(session.date));
    if (!bucket) {
      continue;
    }
    bucket.sessions += 1;
    for (const entry of session.entries) {
      if (session.kind === "run" || entry.sets.length === 0) {
        bucket.runKm += entry.distanceKm ?? 0;
      } else {
        bucket.liftVolumeKg += entryVolumeKg(entry.sets);
      }
    }
  }
  return [...buckets.values()].map((bucket) => ({
    ...bucket,
    liftVolumeKg: round1(bucket.liftVolumeKg),
    runKm: round1(bucket.runKm),
  }));
};

/** Epley estimated 1RM: weight × (1 + reps / 30). */
export const estimatedOneRepMax = (weightKg: number, reps: number) =>
  weightKg * (1 + reps / 30);

const metricPrefix = "lift-e1rm:";

const bestE1rmFor = (sessions: GymSession[], exercise: string) => {
  let best = 0;
  for (const session of sessions) {
    if (session.skipped) {
      continue;
    }
    for (const entry of session.entries) {
      if (entry.name !== exercise) {
        continue;
      }
      for (const set of entry.sets) {
        if (set.weightKg !== null && set.reps !== null && set.reps > 0) {
          best = Math.max(best, estimatedOneRepMax(set.weightKg, set.reps));
        }
      }
    }
  }
  return round1(best);
};

const rollingRunKm = (sessions: GymSession[], todayIso: string) => {
  const windowStart = addDaysIso(todayIso, -6);
  return round1(
    sessions
      .filter(
        (session) =>
          !session.skipped &&
          session.date >= windowStart &&
          session.date <= todayIso
      )
      .reduce(
        (total, session) =>
          total +
          session.entries.reduce(
            (sum, entry) => sum + (entry.distanceKm ?? 0),
            0
          ),
        0
      )
  );
};

const rollingSessionCount = (sessions: GymSession[], todayIso: string) => {
  const windowStart = addDaysIso(todayIso, -6);
  return sessions.filter(
    (session) =>
      !session.skipped &&
      session.date >= windowStart &&
      session.date <= todayIso
  ).length;
};

export interface GoalProgress {
  achieved: boolean;
  currentValue: number;
  /** 0–1 toward target, clamped. */
  fraction: number;
  /** null without a deadline or history. */
  pace: "on-track" | "behind" | null;
}

export const goalProgress = (
  goal: Pick<GymGoal, "deadline" | "metric" | "targetValue">,
  sessions: GymSession[],
  todayIso: string
): GoalProgress => {
  let currentValue = 0;
  if (goal.metric.startsWith(metricPrefix)) {
    currentValue = bestE1rmFor(
      sessions,
      goal.metric.slice(metricPrefix.length)
    );
  } else if (goal.metric === "weekly-run-km") {
    currentValue = rollingRunKm(sessions, todayIso);
  } else if (goal.metric === "weekly-sessions") {
    currentValue = rollingSessionCount(sessions, todayIso);
  } else {
    currentValue = 0;
  }
  const fraction =
    goal.targetValue === 0
      ? 0
      : Math.min(1, Math.max(0, currentValue / goal.targetValue));
  let pace: GoalProgress["pace"] = null;
  if (goal.deadline && goal.targetValue > 0) {
    const total = diffDays(todayIso, goal.deadline);
    // 12-week horizon from the goal date for pacing.
    const elapsed = diffDays(addDaysIso(goal.deadline, -84), todayIso);
    const expected = elapsed / 84;
    pace = fraction >= Math.max(expected, 0) ? "on-track" : "behind";
    if (total < 0) {
      pace = fraction >= 1 ? "on-track" : "behind";
    }
  }
  return {
    achieved: goal.targetValue > 0 && currentValue >= goal.targetValue,
    currentValue,
    fraction,
    pace,
  };
};

/** Consecutive days (ending today or yesterday) with at least one logged,
 * non-skipped session. */
export const sessionStreak = (
  sessions: Pick<GymSession, "date" | "skipped">[],
  todayIso: string
) => {
  const loggedDays = new Set(
    sessions
      .filter((session) => !session.skipped)
      .map((session) => session.date)
  );
  let streak = 0;
  // A streak survives until the end of yesterday; today is a bonus day.
  let cursor = loggedDays.has(todayIso) ? todayIso : addDaysIso(todayIso, -1);
  while (loggedDays.has(cursor)) {
    streak += 1;
    cursor = addDaysIso(cursor, -1);
  }
  return streak;
};
