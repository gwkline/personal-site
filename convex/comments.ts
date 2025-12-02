import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Available reaction emojis
export const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "🎉", "🤔"] as const;

export const list = query({
	args: {
		postSlug: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const allComments = args.postSlug
			? await ctx.db
					.query("comments")
					.withIndex("by_post", (q) => q.eq("postSlug", args.postSlug))
					.order("desc")
					.collect()
			: await ctx.db.query("comments").order("desc").collect();

		// Filter to only top-level comments for the given context
		const topLevelComments = allComments.filter((c) => {
			const matchesPost = args.postSlug
				? c.postSlug === args.postSlug
				: c.postSlug === undefined;
			return !c.parentId && matchesPost;
		});

		return topLevelComments;
	},
});

export const listRecent = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;

		const comments = await ctx.db
			.query("comments")
			.withIndex("by_created")
			.order("desc")
			.take(limit * 2); // Take more to filter out replies

		// Filter to only top-level comments and take the limit
		return comments.filter((c) => !c.parentId).slice(0, limit);
	},
});

export const listGlobal = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;

		const comments = await ctx.db
			.query("comments")
			.withIndex("by_created")
			.order("desc")
			.collect();

		// Filter to global comments only (no postSlug, no parentId)
		return comments
			.filter((c) => c.postSlug === undefined && !c.parentId)
			.slice(0, limit);
	},
});

export const countByPosts = query({
	args: {
		postSlugs: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const counts: Record<string, number> = {};

		await Promise.all(
			args.postSlugs.map(async (slug) => {
				const comments = await ctx.db
					.query("comments")
					.withIndex("by_post", (q) => q.eq("postSlug", slug))
					.collect();

				// Count top-level comments only (exclude replies)
				counts[slug] = comments.filter((c) => !c.parentId).length;
			})
		);

		return counts;
	},
});

export const listReplies = query({
	args: {
		parentId: v.id("comments"),
	},
	handler: async (ctx, args) => {
		const replies = await ctx.db
			.query("comments")
			.withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
			.order("asc")
			.collect();

		return replies;
	},
});

export const add = mutation({
	args: {
		postSlug: v.optional(v.string()),
		content: v.string(),
		parentId: v.optional(v.id("comments")),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);

		if (!user) {
			throw new Error("You must be logged in to comment");
		}

		// If this is a reply, increment parent's reply count
		if (args.parentId) {
			const parent = await ctx.db.get(args.parentId);
			if (parent) {
				await ctx.db.patch(args.parentId, {
					replyCount: (parent.replyCount ?? 0) + 1,
				});
			}
		}

		const commentId = await ctx.db.insert("comments", {
			postSlug: args.postSlug,
			userId: String(user._id),
			userName: user.name ?? user.email ?? "Anonymous",
			userImage: user.image ?? undefined,
			content: args.content,
			createdAt: Date.now(),
			parentId: args.parentId,
			replyCount: 0,
		});

		return commentId;
	},
});

export const remove = mutation({
	args: {
		commentId: v.id("comments"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);

		if (!user) {
			throw new Error("You must be logged in to delete a comment");
		}

		const comment = await ctx.db.get(args.commentId);

		if (!comment) {
			throw new Error("Comment not found");
		}

		if (comment.userId !== String(user._id)) {
			throw new Error("You can only delete your own comments");
		}

		// If this is a reply, decrement parent's reply count
		if (comment.parentId) {
			const parent = await ctx.db.get(comment.parentId);
			if (parent) {
				await ctx.db.patch(comment.parentId, {
					replyCount: Math.max(0, (parent.replyCount ?? 1) - 1),
				});
			}
		}

		// Delete all reactions for this comment
		const reactions = await ctx.db
			.query("reactions")
			.withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
			.collect();

		await Promise.all(reactions.map((r) => ctx.db.delete(r._id)));

		// Delete all replies to this comment
		const replies = await ctx.db
			.query("comments")
			.withIndex("by_parent", (q) => q.eq("parentId", args.commentId))
			.collect();

		await Promise.all(replies.map((r) => ctx.db.delete(r._id)));

		await ctx.db.delete(args.commentId);
	},
});

// Reaction mutations and queries
export const getReactions = query({
	args: {
		commentId: v.id("comments"),
	},
	handler: async (ctx, args) => {
		const reactions = await ctx.db
			.query("reactions")
			.withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
			.collect();

		// Group by emoji with user info - use array instead of object keys to avoid non-ASCII key issues
		const grouped = new Map<string, { count: number; userIds: string[] }>();

		for (const reaction of reactions) {
			const existing = grouped.get(reaction.emoji);
			if (existing) {
				existing.count += 1;
				existing.userIds.push(reaction.userId);
			} else {
				grouped.set(reaction.emoji, { count: 1, userIds: [reaction.userId] });
			}
		}

		// Return as array of objects with emoji as a value, not a key
		return Array.from(grouped.entries()).map(([emoji, data]) => ({
			emoji,
			count: data.count,
			userIds: data.userIds,
		}));
	},
});

export const getReactionsBatch = query({
	args: {
		commentIds: v.array(v.id("comments")),
	},
	handler: async (ctx, args) => {
		const result: Record<
			string,
			Array<{ emoji: string; count: number; userIds: string[] }>
		> = {};

		await Promise.all(
			args.commentIds.map(async (commentId) => {
				const reactions = await ctx.db
					.query("reactions")
					.withIndex("by_comment", (q) => q.eq("commentId", commentId))
					.collect();

				const grouped = new Map<string, { count: number; userIds: string[] }>();

				for (const reaction of reactions) {
					const existing = grouped.get(reaction.emoji);
					if (existing) {
						existing.count += 1;
						existing.userIds.push(reaction.userId);
					} else {
						grouped.set(reaction.emoji, {
							count: 1,
							userIds: [reaction.userId],
						});
					}
				}

				// Convert to array format
				result[commentId] = Array.from(grouped.entries()).map(
					([emoji, data]) => ({
						emoji,
						count: data.count,
						userIds: data.userIds,
					})
				);
			})
		);

		return result;
	},
});

export const toggleReaction = mutation({
	args: {
		commentId: v.id("comments"),
		emoji: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);

		if (!user) {
			throw new Error("You must be logged in to react");
		}

		// Check if user already has this reaction
		const existing = await ctx.db
			.query("reactions")
			.withIndex("by_user_comment", (q) =>
				q.eq("userId", String(user._id)).eq("commentId", args.commentId)
			)
			.filter((q) => q.eq(q.field("emoji"), args.emoji))
			.first();

		if (existing) {
			// Remove the reaction
			await ctx.db.delete(existing._id);
			return { added: false };
		}

		// Add the reaction
		await ctx.db.insert("reactions", {
			commentId: args.commentId,
			userId: String(user._id),
			emoji: args.emoji,
			createdAt: Date.now(),
		});

		return { added: true };
	},
});
