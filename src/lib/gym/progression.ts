/** Deterministic progressive-overload engine. Pure: (plan, sessions) → suggestions.
 * The LLM coach composes explanations around these; it never overrides them. */

import { addDaysIso, diffDays, getDayOfWeek } from "./format";
import { DAY_NAMES, isHardIntensity } from "./types";
import type { GymSession, PlanDay, PlanItem } from "./types";

const DEFAULT_INCREMENT_KG = 2.5;
const RECENT_SESSION_WINDOW_DAYS = 14;
const HIGH_RPE = 9;
// A lift / tempo / lift block is normal athlete programming; flag only when
// four or more hard days stack without an easy day between them.
const MAX_CONSECUTIVE_HARD_DAYS = 3;
const MAX_HARD_DAYS_PER_WEEK = 5;

export interface ItemSuggestion {
  dayOfWeek: number;
  itemName: string;
  currentTargetKg: number | null;
  suggestedKg: number;
  reason: string;
}

export interface PlanFlag {
  level: "info" | "warn";
  summary: string;
}

export interface ProgressionReport {
  itemSuggestions: ItemSuggestion[];
  planFlags: PlanFlag[];
}

const isLiftItem = (item: PlanItem) =>
  item.sets !== null && item.repMax !== null && item.targetWeightKg !== null;

const sessionsByExercise = (sessions: GymSession[]) => {
  const map = new Map<string, GymSession[]>();
  for (const session of sessions) {
    if (session.skipped) {
      continue;
    }
    for (const entry of session.entries) {
      const list = map.get(entry.name) ?? [];
      list.push(session);
      map.set(entry.name, list);
    }
  }
  return map;
};

/** Every set hit ≥ repMax at ≥ targetWeightKg in the most recent session. */
const clearedRepRange = (item: PlanItem, session: GymSession) => {
  const entry = session.entries.find(
    (candidate) => candidate.name === item.name
  );
  if (!entry || entry.sets.length < (item.sets ?? 0)) {
    return false;
  }
  return entry.sets.every(
    (set) =>
      set.reps !== null &&
      set.reps >= (item.repMax ?? 0) &&
      set.weightKg !== null &&
      set.weightKg >= (item.targetWeightKg ?? 0)
  );
};

// hard day = lift session, or a run with tempo/intervals work
const isHardDay = (day: PlanDay) =>
  day.kind === "lift" ||
  (day.kind === "run" &&
    day.items.some((item) => isHardIntensity(item.intensity)));

export const buildProgressionReport = (
  days: PlanDay[],
  sessions: GymSession[],
  todayIso: string
): ProgressionReport => {
  const byExercise = sessionsByExercise(sessions);
  const windowStart = addDaysIso(todayIso, -RECENT_SESSION_WINDOW_DAYS);
  const itemSuggestions: ItemSuggestion[] = [];

  for (const day of days) {
    for (const item of day.items) {
      if (!isLiftItem(item)) {
        continue;
      }
      const history = (byExercise.get(item.name) ?? []).filter(
        (session) => session.date >= windowStart && session.date <= todayIso
      );
      const latest = history.at(-1);
      if (!latest || !clearedRepRange(item, latest)) {
        continue;
      }
      const increment = item.incrementKg ?? DEFAULT_INCREMENT_KG;
      itemSuggestions.push({
        currentTargetKg: item.targetWeightKg,
        dayOfWeek: day.dayOfWeek,
        itemName: item.name,
        reason: `Cleared ${item.sets}×${item.repMax} at ${item.targetWeightKg} kg on ${latest.date}`,
        suggestedKg: (item.targetWeightKg ?? 0) + increment,
      });
    }
  }

  const planFlags: PlanFlag[] = [];
  const ordered = [...days].toSorted((a, b) => a.dayOfWeek - b.dayOfWeek);

  let runStreak = 0;
  let maxRunStreak = 0;
  let hardCount = 0;
  for (const day of ordered) {
    if (isHardDay(day)) {
      hardCount += 1;
      runStreak += 1;
      maxRunStreak = Math.max(maxRunStreak, runStreak);
    } else {
      runStreak = 0;
    }
  }
  if (maxRunStreak > MAX_CONSECUTIVE_HARD_DAYS) {
    planFlags.push({
      level: "warn",
      summary: `${maxRunStreak} hard days in a row — insert an easy or rest day to avoid overtraining.`,
    });
  }
  if (hardCount > MAX_HARD_DAYS_PER_WEEK) {
    planFlags.push({
      level: "warn",
      summary: `${hardCount} hard days this week — cap is ${MAX_HARD_DAYS_PER_WEEK}.`,
    });
  }
  const highRpeDays = sessions
    .filter(
      (session) =>
        session.rpe !== null &&
        session.rpe >= HIGH_RPE &&
        diffDays(addDaysIso(todayIso, -7), session.date) >= 0
    )
    .map((session) => getDayOfWeek(session.date));
  if (highRpeDays.length >= 2) {
    const names = [
      ...new Set(highRpeDays.map((dow) => DAY_NAMES[dow] ?? "a day")),
    ];
    planFlags.push({
      level: "info",
      summary: `Two or more RPE ≥ ${HIGH_RPE} sessions this week (${names.join(", ")}) — consider a lighter week.`,
    });
  }
  return { itemSuggestions, planFlags };
};

/** Guard rail for the weekly structure — hard rule, also checked at validate time. */
export const hasRestDay = (days: PlanDay[]) =>
  days.some((day) => day.kind === "rest");
