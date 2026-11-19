/** LLM coach actions: "what should I do today" and plan-adjust drafts.
 * Both are owner-gated and never write plan data — drafts return to the UI
 * and are applied only through the validated gym mutations. */

import { v } from "convex/values";

import { getDayOfWeek } from "../src/lib/gym/format";
import { buildProgressionReport } from "../src/lib/gym/progression";
import { normalizePlanDays, validatePlanDays } from "../src/lib/gym/validate";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { callCoachLlm, coachLlmConfigured } from "./gymLlm";
import type { LlmMessage } from "./gymLlm";

const ATHLETE_PROFILE = [
  "You are the training coach inside Gavin's gym tracker web app.",
  "Gavin: former D1 lacrosse athlete. Lifts 3x/week and runs 3-4x/week in NYC.",
  "He has exercise-induced asthma and carries an inhaler: any tempo or intervals run must keep the note",
  '"Carry inhaler. 10-min easy warm-up ramp before the hard block." and must not follow a heavy leg day.',
  "Rules you must respect:",
  "- At least one full rest day per week (kind: rest).",
  "- Never more than 3 consecutive hard days, where hard = lift session or a run with tempo/intervals intensity.",
  "- Keep planned weekly run volume changes within ~10% of the current plan.",
  "- Take weight progression mechanics from the provided progression suggestions; never invent jumps beyond them.",
  "- Tone: direct and concrete, athlete to athlete. No filler, no medical disclaimers, no motivational padding.",
].join("\n");

interface CoachSessionSummary {
  date: string;
  entries: unknown[];
  kind: string;
  notes: string | null;
  rpe: number | null;
  skipped: boolean;
  title: string;
}

interface CoachPlanDay {
  dayOfWeek: number;
  items: unknown[];
  kind: string;
  title: string;
}

interface CoachContext {
  goals: { metric: string; targetValue: number; title: string; unit: string }[];
  isOwner: boolean;
  plan: { days: CoachPlanDay[]; name: string; version: number } | null;
  sessions: CoachSessionSummary[];
  todayIso: string;
  timezone: string;
}

const noKeyError = () =>
  new Error(
    "OPENCODE_GO_API_KEY is not set on the Convex deployment — see docs/gym/03-architecture.md"
  );

const buildTodayMessages = (context: CoachContext): LlmMessage[] => {
  const system = [
    ATHLETE_PROFILE,
    "",
    "Reply with ONE JSON object, no markdown, exactly this shape:",
    "{",
    '  "headline": string,            // one sentence, e.g. "Legs today — you cleared squats, so bump it."',
    '  "reasoning": string,           // 2-4 sentences, why this session today',
    '  "notes": string|null          // optional flag, e.g. asthma or fatigue warning',
    "}",
    "",
    "You are choosing today's session, not rewriting the plan. Ground it in",
    "the planned day, the logged history, and the progression suggestions.",
  ].join("\n");

  const todayDay = context.plan?.days.find(
    (day) => day.dayOfWeek === getDayOfWeek(context.todayIso)
  );

  const user = [
    `Today is ${context.todayIso} (${context.timezone}).`,
    context.plan
      ? `Active plan: "${context.plan.name}" v${context.plan.version}.`
      : "There is no active plan yet.",
    todayDay
      ? `Planned day: ${JSON.stringify(todayDay)}`
      : "No planned day found for today.",
    `Recent sessions (last 14 days): ${JSON.stringify(context.sessions)}`,
    `Active goals: ${JSON.stringify(context.goals)}`,
    `Progression suggestions: ${JSON.stringify(
      buildProgressionReport(
        (context.plan?.days ?? []) as Parameters<
          typeof buildProgressionReport
        >[0],
        context.sessions as Parameters<typeof buildProgressionReport>[1],
        context.todayIso
      )
    )}`,
    "Give today's call.",
  ].join("\n");

  return [
    { content: system, role: "system" },
    { content: user, role: "user" },
  ];
};

export const today = action({
  args: {},
  handler: async (ctx) => {
    if (!coachLlmConfigured()) {
      throw noKeyError();
    }
    const context = await ctx.runQuery(internal.gym.getCoachContext, {});
    if (!context.isOwner) {
      throw new Error("The coach is only available to the owner");
    }
    const messages = buildTodayMessages(context);
    const result = await callCoachLlm(ctx, {
      instruction: null,
      kind: "today",
      messages,
    });
    const parsed = result.parsed ?? {};
    return {
      headline: typeof parsed.headline === "string" ? parsed.headline : "",
      notes: typeof parsed.notes === "string" ? parsed.notes : null,
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
      usage: result.usage,
    };
  },
});

const buildAdjustMessages = (
  context: CoachContext,
  instruction: string
): LlmMessage[] => {
  const system = [
    ATHLETE_PROFILE,
    "",
    "Reply with ONE JSON object, no markdown, exactly this shape:",
    "{",
    '  "plan": [ // exactly 7 days, dayOfWeek 0=Monday … 6=Sunday, one per weekday',
    '    { "dayOfWeek": number, "kind": "lift"|"run"|"rest"|"cross-train", "title": string,',
    '      "items": [ { "name": string, "sets": number|null, "repMin": number|null, "repMax": number|null,',
    '        "targetWeightKg": number|null, "incrementKg": number|null, "durationMin": number|null,',
    '        "distanceKm": number|null, "intensity": "easy"|"steady"|"tempo"|"intervals"|null, "notes": string|null } ] }',
    "  ],",
    '  "changes": [ { "summary": string, "before": string|null, "after": string|null } ],',
    '  "explanation": string   // 3-6 sentences: what changed and why, athlete tone',
    "}",
    "",
    "Only change what the instruction requires plus any progression the",
    "suggestions justify. Keep the rest of the plan identical, day names and all.",
    "Every change must appear in the changes list.",
  ].join("\n");

  const user = [
    `Today is ${context.todayIso} (${context.timezone}).`,
    `Active plan: ${JSON.stringify(context.plan)}`,
    `Recent sessions (last 14 days): ${JSON.stringify(context.sessions)}`,
    `Active goals: ${JSON.stringify(context.goals)}`,
    `Progression suggestions: ${JSON.stringify(
      buildProgressionReport(
        (context.plan?.days ?? []) as Parameters<
          typeof buildProgressionReport
        >[0],
        context.sessions as Parameters<typeof buildProgressionReport>[1],
        context.todayIso
      )
    )}`,
    `Instruction from Gavin: ${instruction}`,
    "Return the full revised plan as the JSON object.",
  ].join("\n");

  return [
    { content: system, role: "system" },
    { content: user, role: "user" },
  ];
};

export const adjustPlan = action({
  args: { instruction: v.string() },
  handler: async (ctx, args) => {
    if (!coachLlmConfigured()) {
      throw noKeyError();
    }
    const instruction = args.instruction.trim().slice(0, 600);
    if (instruction === "") {
      throw new Error("Tell the coach what to change");
    }
    const context = await ctx.runQuery(internal.gym.getCoachContext, {});
    if (!context.isOwner) {
      throw new Error("The coach is only available to the owner");
    }
    if (!context.plan) {
      throw new Error("No active plan to adjust — seed or create one first");
    }
    const result = await callCoachLlm(ctx, {
      instruction,
      kind: "adjust",
      messages: buildAdjustMessages(context, instruction),
    });
    const parsed = result.parsed ?? {};
    const days = normalizePlanDays(parsed.plan);
    const validation = validatePlanDays(days);
    if (!validation.valid) {
      // Surface the invalid draft instead of applying anything.
      return {
        changes: [],
        days: null,
        error: `The coach's draft did not validate: ${validation.error}`,
        explanation:
          typeof parsed.explanation === "string" ? parsed.explanation : "",
      };
    }
    return {
      changes: Array.isArray(parsed.changes)
        ? parsed.changes
            .filter(
              (change): change is Record<string, unknown> =>
                typeof change === "object" && change !== null
            )
            .map((change) => ({
              after: typeof change.after === "string" ? change.after : null,
              before: typeof change.before === "string" ? change.before : null,
              summary:
                typeof change.summary === "string"
                  ? change.summary
                  : "Unnamed change",
            }))
        : [],
      days,
      error: null,
      explanation:
        typeof parsed.explanation === "string" ? parsed.explanation : "",
    };
  },
});
