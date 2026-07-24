import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";
import { assertOwner } from "./lib/owner";

export const getRun = internalQuery({
  args: {
    runId: v.id("depthsRuns"),
  },
  handler: (ctx, args) => ctx.db.get(args.runId),
});

export const getScoreForRun = internalQuery({
  args: {
    runId: v.id("depthsRuns"),
  },
  handler: (ctx, args) =>
    ctx.db
      .query("depthsScores")
      .withIndex("by_run", (index) => index.eq("runId", args.runId))
      .first(),
});

export const listRecentRuns = internalQuery({
  args: {
    sessionId: v.string(),
  },
  handler: (ctx, args) =>
    ctx.db
      .query("depthsRuns")
      .withIndex("by_session", (index) => index.eq("sessionId", args.sessionId))
      .order("desc")
      .take(3),
});

export const listScores = internalQuery({
  args: {
    limit: v.number(),
  },
  handler: (ctx, args) =>
    ctx.db
      .query("depthsScores")
      .withIndex("by_score")
      .order("desc")
      .take(args.limit),
});

export const insertRun = internalMutation({
  args: {
    issuedAt: v.number(),
    seed: v.number(),
    sessionId: v.string(),
  },
  handler: (ctx, args) =>
    ctx.db.insert("depthsRuns", {
      completedAt: undefined,
      issuedAt: args.issuedAt,
      lastCheckpointAt: args.issuedAt,
      maxFloor: 1,
      maxScore: 0,
      seed: args.seed,
      sessionId: args.sessionId,
      status: "active",
    }),
});

export const patchRun = internalMutation({
  args: {
    completedAt: v.optional(v.number()),
    lastCheckpointAt: v.number(),
    maxFloor: v.number(),
    maxScore: v.number(),
    runId: v.id("depthsRuns"),
    status: v.union(v.literal("active"), v.literal("completed")),
  },
  handler: (ctx, args) =>
    ctx.db.patch(args.runId, {
      completedAt: args.completedAt,
      lastCheckpointAt: args.lastCheckpointAt,
      maxFloor: args.maxFloor,
      maxScore: args.maxScore,
      status: args.status,
    }),
});

export const insertScore = internalMutation({
  args: {
    createdAt: v.number(),
    durationMs: v.number(),
    floor: v.number(),
    initials: v.string(),
    runId: v.id("depthsRuns"),
    score: v.number(),
    seed: v.number(),
  },
  handler: (ctx, args) => ctx.db.insert("depthsScores", args),
});

export const removeScore = internalMutation({
  args: {
    scoreId: v.id("depthsScores"),
  },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    await ctx.db.delete(args.scoreId);
  },
});
