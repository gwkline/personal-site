import { v } from "convex/values";

import { addDaysIso, getDayOfWeek, getTodayIso } from "../src/lib/gym/format";
import { sessionStreak } from "../src/lib/gym/metrics";
import {
  buildDemoSessions,
  STARTER_GOALS,
  STARTER_PLAN_DAYS,
  STARTER_PLAN_NAME,
} from "../src/lib/gym/seed";
import type { PlanDay } from "../src/lib/gym/types";
import { normalizePlanDay, validatePlanDays } from "../src/lib/gym/validate";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { assertOwner, isOwner } from "./lib/owner";

type DbCtx = MutationCtx | QueryCtx;

const DEFAULT_TIMEZONE = "America/New_York";
const SESSION_HISTORY_LIMIT = 120;
const COACH_CONTEXT_DAYS = 14;
const DEFAULT_NUDGE_TIME = "17:30";
const ISO_DATE_PATTERN = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u;
const NUDGE_TIME_PATTERN = /^(?<hour>[01]\d|2[0-3]):(?<minute>[0-5]\d)$/u;

const nullableNumber = () => v.union(v.number(), v.null());
const nullableString = () => v.union(v.string(), v.null());

const vPlanItem = v.object({
  distanceKm: nullableNumber(),
  durationMin: nullableNumber(),
  incrementKg: nullableNumber(),
  intensity: nullableString(),
  name: v.string(),
  notes: nullableString(),
  repMax: nullableNumber(),
  repMin: nullableNumber(),
  sets: nullableNumber(),
  targetWeightKg: nullableNumber(),
});

const vPlanDay = v.object({
  dayOfWeek: v.number(),
  items: v.array(vPlanItem),
  kind: v.string(),
  title: v.string(),
});

const vLoggedSet = v.object({
  reps: nullableNumber(),
  weightKg: nullableNumber(),
});

const vSessionEntry = v.object({
  distanceKm: nullableNumber(),
  durationMin: nullableNumber(),
  name: v.string(),
  notes: nullableString(),
  sets: v.array(vLoggedSet),
});

const readSettings = (ctx: DbCtx) =>
  ctx.db
    .query("gymSettings")
    .withIndex("by_key", (q) => q.eq("key", "primary"))
    .unique();

const getActivePlan = (ctx: DbCtx) =>
  ctx.db
    .query("gymPlans")
    .withIndex("by_active", (q) => q.eq("active", true))
    .unique();

export const get = query({
  args: {},
  handler: async (ctx) => {
    const owner = await isOwner(ctx);
    const plan = await getActivePlan(ctx);
    const sessionDocs = await ctx.db
      .query("gymSessions")
      .withIndex("by_date", (q) => q.gt("date", "0000"))
      .order("desc")
      .take(SESSION_HISTORY_LIMIT);
    // withIndex does not support neq; a scan + filter is fine at this scale.
    const allGoals = await ctx.db.query("gymGoals").collect();
    const goalDocs = allGoals.filter((goal) => goal.status !== "retired");
    const settings = await readSettings(ctx);

    return {
      goals: goalDocs.map((goal) => ({
        _id: goal._id,
        createdAt: goal.createdAt,
        deadline: goal.deadline ?? null,
        metric: goal.metric,
        status: goal.status,
        targetValue: goal.targetValue,
        title: goal.title,
        unit: goal.unit,
      })),
      isOwner: owner,
      plan: plan
        ? {
            _id: plan._id,
            days: plan.days,
            name: plan.name,
            reason: plan.reason,
            version: plan.version,
          }
        : null,
      sessions: sessionDocs.map((doc) => ({
        _id: doc._id,
        date: doc.date,
        dayOfWeek: doc.dayOfWeek,
        entries: doc.entries,
        kind: doc.kind,
        notes: doc.notes ?? null,
        planVersion: doc.planVersion ?? null,
        rpe: doc.rpe ?? null,
        skipped: doc.skipped ?? false,
        title: doc.title,
        updatedAt: doc.updatedAt,
      })),
      settings: {
        nudgeEnabled: settings?.nudgeEnabled ?? false,
        nudgeTime: owner ? (settings?.nudgeTime ?? DEFAULT_NUDGE_TIME) : null,
        timezone: settings?.timezone ?? DEFAULT_TIMEZONE,
      },
    };
  },
});

export const setNudge = mutation({
  args: { enabled: v.boolean(), nudgeTime: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    const existing = await readSettings(ctx);
    const nudgeTime =
      args.nudgeTime?.trim() || (existing?.nudgeTime ?? DEFAULT_NUDGE_TIME);
    if (!NUDGE_TIME_PATTERN.test(nudgeTime)) {
      throw new Error("Nudge time must be HH:MM (24h)");
    }
    if (existing) {
      await ctx.db.patch(existing._id, {
        nudgeEnabled: args.enabled,
        nudgeTime,
        timezone: existing.timezone,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return ctx.db.insert("gymSettings", {
      key: "primary",
      nudgeEnabled: args.enabled,
      nudgeTime,
      timezone: DEFAULT_TIMEZONE,
      updatedAt: Date.now(),
    });
  },
});

const insertPlanVersion = async (
  ctx: MutationCtx,
  args: { days: PlanDay[]; name: string; reason: string }
) => {
  const active = await getActivePlan(ctx);
  const version = (active?.version ?? 0) + 1;
  if (active) {
    await ctx.db.patch(active._id, { active: false, updatedAt: Date.now() });
  }
  return ctx.db.insert("gymPlans", {
    active: true,
    createdAt: Date.now(),
    days: args.days,
    name: args.name,
    reason: args.reason,
    updatedAt: Date.now(),
    version,
  });
};

/** Shared gate for every full-plan write: manual edits, seed, coach drafts. */
const applyPlanChange = async (
  ctx: MutationCtx,
  args: { days: unknown; name?: string; reason: string }
) => {
  const active = await getActivePlan(ctx);
  const rawDays = Array.isArray(args.days) ? args.days : [];
  const normalized = rawDays.map((day) =>
    normalizePlanDay(
      typeof day === "object" && day !== null
        ? (day as Record<string, unknown>)
        : {}
    )
  );
  const validation = validatePlanDays(normalized);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Invalid plan");
  }
  const id = await insertPlanVersion(ctx, {
    days: normalized,
    name: args.name ?? active?.name ?? STARTER_PLAN_NAME,
    reason: args.reason,
  });
  return { days: normalized, id };
};

export const upsertPlanDay = mutation({
  args: { day: vPlanDay },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    const active = await getActivePlan(ctx);
    if (!active) {
      throw new Error("No active plan — create or seed one first");
    }
    const incoming = normalizePlanDay(
      args.day as unknown as Record<string, unknown>
    );
    const days: PlanDay[] = active.days.map((day) =>
      day.dayOfWeek === incoming.dayOfWeek ? incoming : day
    );
    if (!days.some((day) => day.dayOfWeek === incoming.dayOfWeek)) {
      days.push(incoming);
    }
    await applyPlanChange(ctx, {
      days,
      reason: `Manual edit — ${incoming.title}`,
    });
  },
});

export const renamePlan = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    const name = args.name.trim().slice(0, 80);
    if (name === "") {
      throw new Error("Plan name cannot be empty");
    }
    const active = await getActivePlan(ctx);
    if (!active) {
      throw new Error("No active plan to rename");
    }
    await ctx.db.patch(active._id, { name, updatedAt: Date.now() });
  },
});

export const applyPlanDraft = mutation({
  args: {
    days: v.array(vPlanDay),
    name: v.optional(v.string()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    const reason = args.reason.trim().slice(0, 240);
    if (reason === "") {
      throw new Error("A plan change needs a reason");
    }
    const name = args.name?.trim().slice(0, 80);
    await applyPlanChange(ctx, {
      days: args.days,
      name: name === "" ? undefined : name,
      reason,
    });
  },
});

export const logSession = mutation({
  args: {
    date: v.string(),
    entries: v.array(vSessionEntry),
    kind: v.string(),
    notes: v.optional(v.string()),
    planVersion: v.optional(v.number()),
    rpe: v.optional(v.number()),
    skipped: v.optional(v.boolean()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    if (!ISO_DATE_PATTERN.test(args.date)) {
      throw new Error("Date must be YYYY-MM-DD");
    }
    if (args.date > getTodayIso()) {
      throw new Error("Future sessions cannot be logged");
    }
    if (args.rpe !== undefined && (args.rpe < 1 || args.rpe > 10)) {
      throw new Error("RPE must be between 1 and 10");
    }
    const title = args.title.trim().slice(0, 80);
    if (title === "") {
      throw new Error("Session needs a title");
    }
    const notes = args.notes?.trim().slice(0, 500) ?? null;
    const kind = (["lift", "run", "cross-train"] as const).find(
      (value) => value === args.kind
    );
    if (!kind) {
      throw new Error("Kind must be lift, run, or cross-train");
    }
    const existing = await ctx.db
      .query("gymSessions")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    const match = existing.find((doc) => doc.title === title);
    const values = {
      date: args.date,
      dayOfWeek: getDayOfWeek(args.date),
      entries: args.entries.filter((entry) => entry.name.trim() !== ""),
      kind,
      notes,
      planVersion: args.planVersion ?? null,
      rpe: args.rpe ?? null,
      skipped: args.skipped ?? false,
      title,
      updatedAt: Date.now(),
    };
    if (match) {
      await ctx.db.patch(match._id, values);
      return match._id;
    }
    return ctx.db.insert("gymSessions", { createdAt: Date.now(), ...values });
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.id("gymSessions") },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    await ctx.db.delete(args.sessionId);
  },
});

export const upsertGoal = mutation({
  args: {
    deadline: v.optional(v.string()),
    goalId: v.optional(v.id("gymGoals")),
    metric: v.string(),
    targetValue: v.number(),
    title: v.string(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    const title = args.title.trim().slice(0, 120);
    if (title === "") {
      throw new Error("Goal needs a title");
    }
    if (!(args.targetValue > 0)) {
      throw new Error("Goal target must be positive");
    }
    if (
      !(
        args.metric.startsWith("lift-e1rm:") ||
        args.metric === "weekly-run-km" ||
        args.metric === "weekly-sessions"
      )
    ) {
      throw new Error("Unknown goal metric");
    }
    const values = {
      deadline:
        args.deadline && ISO_DATE_PATTERN.test(args.deadline)
          ? args.deadline
          : null,
      metric: args.metric,
      status: "active" as const,
      targetValue: args.targetValue,
      title,
      unit: args.unit.trim().slice(0, 16) || "value",
      updatedAt: Date.now(),
    };
    if (args.goalId) {
      await ctx.db.patch(args.goalId, values);
      return args.goalId;
    }
    return ctx.db.insert("gymGoals", { createdAt: Date.now(), ...values });
  },
});

export const retireGoal = mutation({
  args: { goalId: v.id("gymGoals") },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    await ctx.db.patch(args.goalId, {
      status: "retired",
      updatedAt: Date.now(),
    });
  },
});

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    await assertOwner(ctx);
    const active = await getActivePlan(ctx);
    const existingSessions = await ctx.db
      .query("gymSessions")
      .withIndex("by_date", (q) => q.gt("date", "0000"))
      .first();
    const allGoals = await ctx.db.query("gymGoals").collect();
    const existingGoals = allGoals.some((goal) => goal.status !== "retired");

    let seededPlan = false;
    if (!active) {
      const validation = validatePlanDays(STARTER_PLAN_DAYS);
      if (!validation.valid) {
        throw new Error(`Starter plan is invalid: ${validation.error}`);
      }
      await ctx.db.insert("gymPlans", {
        active: true,
        createdAt: Date.now(),
        days: STARTER_PLAN_DAYS,
        name: STARTER_PLAN_NAME,
        reason: "Starter plan — run/lift balance",
        updatedAt: Date.now(),
        version: 1,
      });
      seededPlan = true;
    }

    let seededSessions = 0;
    if (!existingSessions) {
      const todayIso = getTodayIso();
      // Sequential inserts keep creation order aligned with dates.
      // eslint-disable-next-line no-await-in-loop -- intentional
      for (const session of buildDemoSessions(todayIso)) {
        // eslint-disable-next-line no-await-in-loop -- intentional
        await ctx.db.insert("gymSessions", {
          createdAt: Date.now(),
          date: session.date,
          dayOfWeek: session.dayOfWeek,
          entries: session.entries,
          kind: session.kind,
          notes: session.notes,
          planVersion: 1,
          rpe: session.rpe,
          skipped: session.skipped,
          title: session.title,
          updatedAt: session.updatedAt,
        });
        seededSessions += 1;
      }
    }

    let seededGoals = 0;
    if (!existingGoals) {
      // eslint-disable-next-line no-await-in-loop -- intentional
      for (const goal of STARTER_GOALS) {
        // eslint-disable-next-line no-await-in-loop -- intentional
        await ctx.db.insert("gymGoals", {
          createdAt: Date.now(),
          deadline: null,
          metric: goal.metric,
          status: "active",
          targetValue: goal.targetValue,
          title: goal.title,
          unit: goal.unit,
          updatedAt: Date.now(),
        });
        seededGoals += 1;
      }
    }

    return { seededGoals, seededPlan, seededSessions };
  },
});

/** Audit writes for LLM calls, invoked from actions via runMutation. */
export const logCoachCall = internalMutation({
  args: {
    attempt: v.number(),
    completionTokens: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    instruction: v.optional(v.string()),
    kind: v.string(),
    model: v.string(),
    promptTokens: v.optional(v.number()),
    requestJson: v.string(),
    responseJson: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("gymCoachLogs", {
      attempt: args.attempt,
      completionTokens: args.completionTokens,
      createdAt: Date.now(),
      errorMessage: args.errorMessage,
      instruction: args.instruction,
      kind: args.kind,
      model: args.model,
      promptTokens: args.promptTokens,
      requestJson: args.requestJson,
      responseJson: args.responseJson,
      status: args.status,
    });
  },
});

/** Context bundle for the coach actions. Actions cannot check auth directly,
 * so the owner gate lives here. */
export const getCoachContext = internalQuery({
  args: {},
  handler: async (ctx) => {
    const owner = await isOwner(ctx);
    if (!owner) {
      return { isOwner: false } as const;
    }
    const settings = await readSettings(ctx);
    const timezone = settings?.timezone ?? DEFAULT_TIMEZONE;
    const todayIso = getTodayIso(timezone);
    const plan = await getActivePlan(ctx);
    const since = addDaysIso(todayIso, -(COACH_CONTEXT_DAYS - 1));
    const sessions = await ctx.db
      .query("gymSessions")
      .withIndex("by_date", (q) => q.gte("date", since).lte("date", todayIso))
      .collect();
    const goals = await ctx.db
      .query("gymGoals")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    return {
      goals: goals.map((goal) => ({
        metric: goal.metric,
        targetValue: goal.targetValue,
        title: goal.title,
        unit: goal.unit,
      })),
      isOwner: true,
      plan: plan
        ? { days: plan.days, name: plan.name, version: plan.version }
        : null,
      sessions: sessions.map((doc) => ({
        date: doc.date,
        entries: doc.entries,
        kind: doc.kind,
        notes: doc.notes ?? null,
        rpe: doc.rpe ?? null,
        skipped: doc.skipped ?? false,
        title: doc.title,
      })),
      timezone,
      todayIso,
    };
  },
});

/** Status data for the accountability nudge script. Read-only: the flag
 * itself lives in gymSettings, so the script stays config-free and safe. */
export const getNudgeStatus = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await readSettings(ctx);
    const timezone = settings?.timezone ?? DEFAULT_TIMEZONE;
    const enabled = settings?.nudgeEnabled ?? false;
    const todayIso = getTodayIso(timezone);
    const plan = await getActivePlan(ctx);
    const todayPlanDay = plan?.days.find(
      (day) => day.dayOfWeek === getDayOfWeek(todayIso)
    );
    const recentSessions = await ctx.db
      .query("gymSessions")
      .withIndex("by_date", (q) => q.gte("date", addDaysIso(todayIso, -13)))
      .collect();
    const loggedToday = recentSessions.some(
      (doc) => doc.date === todayIso && !doc.skipped
    );
    return {
      date: todayIso,
      enabled,
      loggedToday,
      plannedTitle: todayPlanDay?.title ?? null,
      streak: sessionStreak(
        recentSessions.map((doc) => ({
          date: doc.date,
          skipped: doc.skipped ?? false,
        })),
        todayIso
      ),
    };
  },
});
