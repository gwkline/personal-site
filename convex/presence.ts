import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

// Consider users active if seen in the last 30 seconds.
const ACTIVE_THRESHOLD_MS = 30_000;
export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    await (existing
      ? ctx.db.patch(existing._id, { lastSeen: Date.now() })
      : ctx.db.insert("presence", {
          lastSeen: Date.now(),
          sessionId: args.sessionId,
        }));
  },
});
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const activeThreshold = now - ACTIVE_THRESHOLD_MS;
    // Get all presence records
    const allPresence = await ctx.db.query("presence").collect();
    // Count unique sessions (total visitors ever)
    const totalSessions = allPresence.length;
    // Count active users (seen in last 30 seconds)
    const activeUsers = allPresence.filter(
      (p) => p.lastSeen > activeThreshold
    ).length;
    return {
      activeUsers,
      totalSessions,
    };
  },
});
