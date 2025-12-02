import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ACTIVE_THRESHOLD_MS = 30_000; // Consider users active if seen in last 30 seconds

export const heartbeat = mutation({
	args: {
		sessionId: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("presence")
			.withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, { lastSeen: Date.now() });
		} else {
			await ctx.db.insert("presence", {
				sessionId: args.sessionId,
				lastSeen: Date.now(),
			});
		}
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
			totalSessions,
			activeUsers,
		};
	},
});
