/** Plan validators. The same rules run on manual edits, seed data, and
 * coach drafts, so an LLM can never write an invalid plan. */

import { DAY_NAMES, GYM_DAY_COUNT } from "./types";
import type { PlanDay, PlanItem } from "./types";

const MAX_ITEMS_PER_DAY = 12;
const MAX_TITLE_LENGTH = 80;
const MAX_NOTES_LENGTH = 280;
const WEIGHT_STEP = 1.25;

const asNumberOrNull = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const clampWeight = (kg: number | null) => {
  if (kg === null) {
    return null;
  }
  return Math.round(kg / WEIGHT_STEP) * WEIGHT_STEP;
};

/** Normalize untrusted input (coach JSON, form state) into a PlanItem. */
export const normalizePlanItem = (raw: Record<string, unknown>): PlanItem => ({
  distanceKm: asNumberOrNull(raw.distanceKm),
  durationMin: asNumberOrNull(raw.durationMin),
  incrementKg: asNumberOrNull(raw.incrementKg),
  intensity:
    typeof raw.intensity === "string"
      ? ((["easy", "steady", "tempo", "intervals"] as const).find(
          (value) => value === raw.intensity
        ) ?? null)
      : null,
  name: typeof raw.name === "string" ? raw.name.trim().slice(0, 80) : "",
  notes:
    typeof raw.notes === "string"
      ? raw.notes.trim().slice(0, MAX_NOTES_LENGTH)
      : null,
  repMax: asNumberOrNull(raw.repMax),
  repMin: asNumberOrNull(raw.repMin),
  sets: asNumberOrNull(raw.sets),
  targetWeightKg: clampWeight(asNumberOrNull(raw.targetWeightKg)),
});

export const normalizePlanDay = (raw: Record<string, unknown>): PlanDay => {
  const kind =
    typeof raw.kind === "string"
      ? ((["lift", "run", "rest", "cross-train"] as const).find(
          (value) => value === raw.kind
        ) ?? "rest")
      : "rest";
  const items = Array.isArray(raw.items)
    ? raw.items
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null
        )
        .map(normalizePlanItem)
        .filter((item) => item.name !== "")
        .slice(0, MAX_ITEMS_PER_DAY)
    : [];
  const title =
    typeof raw.title === "string"
      ? raw.title.trim().slice(0, MAX_TITLE_LENGTH)
      : "";
  return {
    dayOfWeek: asNumberOrNull(raw.dayOfWeek) ?? 0,
    items,
    kind,
    title,
  };
};

export const normalizePlanDays = (raw: unknown): PlanDay[] =>
  Array.isArray(raw)
    ? raw
        .filter(
          (day): day is Record<string, unknown> =>
            typeof day === "object" && day !== null
        )
        .map(normalizePlanDay)
    : [];

const validatePlanItem = (item: PlanItem, day: PlanDay): string | null => {
  if (item.name.trim() === "") {
    return `${day.title}: empty exercise name`;
  }
  if (day.kind === "run") {
    const hasDistance = item.distanceKm !== null && item.distanceKm > 0;
    const hasDuration = item.durationMin !== null && item.durationMin > 0;
    if (!hasDistance && !hasDuration && !item.notes) {
      return `${day.title}: run items need distance, duration, or notes`;
    }
    return null;
  }
  if (item.sets !== null && item.sets < 1) {
    return `${day.title}: ${item.name} needs at least 1 set`;
  }
  if (
    item.repMin !== null &&
    item.repMax !== null &&
    item.repMin > item.repMax
  ) {
    return `${day.title}: ${item.name} repMin cannot exceed repMax`;
  }
  return null;
};

/** One day's structural rules; returns an error string or null when valid. */
const validatePlanDay = (
  day: PlanDay,
  seenDays: Set<number>
): string | null => {
  if (
    !Number.isInteger(day.dayOfWeek) ||
    day.dayOfWeek < 0 ||
    day.dayOfWeek > 6
  ) {
    return "dayOfWeek must be 0-6";
  }
  if (seenDays.has(day.dayOfWeek)) {
    return `Duplicate ${DAY_NAMES[day.dayOfWeek]} entry`;
  }
  if (day.title.trim() === "") {
    return `${DAY_NAMES[day.dayOfWeek]} needs a title (use "Rest" if it's off)`;
  }
  if (day.kind === "rest") {
    return null;
  }
  if (day.items.length === 0) {
    return `${DAY_NAMES[day.dayOfWeek]} has no exercises`;
  }
  for (const item of day.items) {
    const itemError = validatePlanItem(item, day);
    if (itemError !== null) {
      return itemError;
    }
  }
  return null;
};

export const validatePlanDays = (
  days: PlanDay[]
): { error: string | null; valid: boolean } => {
  if (days.length !== GYM_DAY_COUNT) {
    return {
      error: `Plan must have exactly ${GYM_DAY_COUNT} days`,
      valid: false,
    };
  }
  const seenDays = new Set<number>();
  let restDays = 0;
  for (const day of days) {
    const dayError = validatePlanDay(day, seenDays);
    if (dayError !== null) {
      return { error: dayError, valid: false };
    }
    if (day.kind === "rest") {
      restDays += 1;
    }
    seenDays.add(day.dayOfWeek);
  }
  if (restDays === 0) {
    return {
      error: "Plan needs at least one full rest day per week",
      valid: false,
    };
  }
  return { error: null, valid: true };
};
