/** Gym tracker domain types. Shared by src components and convex functions. */
import type { Id } from "../../../convex/_generated/dataModel";

export const GYM_DAY_COUNT = 7;

/** 0 = Monday … 6 = Sunday. Kept stable across plan, sessions, and charts. */
export type DayOfWeek = number;

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const DAY_SHORT_NAMES = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export type PlanDayKind = "lift" | "run" | "rest" | "cross-train";
export type SessionKind = "lift" | "run" | "cross-train";

export type RunIntensity = "easy" | "steady" | "tempo" | "intervals";

export interface PlanItem {
  name: string;
  sets: number | null;
  repMin: number | null;
  repMax: number | null;
  targetWeightKg: number | null;
  incrementKg: number | null;
  durationMin: number | null;
  distanceKm: number | null;
  intensity: RunIntensity | null;
  notes: string | null;
}

export interface PlanDay {
  dayOfWeek: DayOfWeek;
  kind: PlanDayKind;
  title: string;
  items: PlanItem[];
}

export interface GymPlanSummary {
  _id: string;
  name: string;
  version: number;
  reason: string;
  days: PlanDay[];
}

export interface LoggedSet {
  weightKg: number | null;
  reps: number | null;
}

export interface SessionEntry {
  name: string;
  sets: LoggedSet[];
  distanceKm: number | null;
  durationMin: number | null;
  notes: string | null;
}

export interface GymSession {
  _id: string;
  date: string;
  dayOfWeek: DayOfWeek;
  title: string;
  kind: SessionKind;
  planVersion: number | null;
  entries: SessionEntry[];
  rpe: number | null;
  notes: string | null;
  skipped: boolean;
  updatedAt: number;
}

export type GoalMetricKind = "lift-e1rm" | "weekly-run-km" | "weekly-sessions";

export interface GymGoal {
  _id: Id<"gymGoals">;
  title: string;
  metric: string;
  targetValue: number;
  unit: string;
  deadline: string | null;
  status: "active" | "achieved" | "retired";
  createdAt: number;
}

export interface GymSettingsPublic {
  nudgeEnabled: boolean;
  timezone: string;
}

/** Shape the coach actions accept/return. Same validators as manual edits. */
export interface CoachChange {
  summary: string;
  before: string | null;
  after: string | null;
}

export interface CoachAdjustResponse {
  plan: PlanDay[];
  changes: CoachChange[];
  explanation: string;
}

export interface CoachTodayResponse {
  headline: string;
  session: {
    title: string;
    kind: PlanDayKind;
    items: PlanItem[];
  };
  reasoning: string;
  notes: string | null;
}

export const isHardIntensity = (intensity: RunIntensity | null) =>
  intensity === "tempo" || intensity === "intervals";
