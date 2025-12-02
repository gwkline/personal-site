import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// Comments table for blog posts and global comments
	comments: defineTable({
		postSlug: v.optional(v.string()), // Optional - null for global comments
		userId: v.string(),
		userName: v.string(),
		userImage: v.optional(v.string()),
		content: v.string(),
		createdAt: v.number(),
		parentId: v.optional(v.id("comments")), // For threading/replies
		replyCount: v.optional(v.number()), // Denormalized count for performance
	})
		.index("by_post", ["postSlug"])
		.index("by_user", ["userId"])
		.index("by_created", ["createdAt"])
		.index("by_parent", ["parentId"]),

	// Reactions table for comments
	reactions: defineTable({
		commentId: v.id("comments"),
		userId: v.string(),
		emoji: v.string(), // e.g., "👍", "❤️", "🔥", "😂", "🎉", "🤔"
		createdAt: v.number(),
	})
		.index("by_comment", ["commentId"])
		.index("by_user_comment", ["userId", "commentId"]),

	// Presence tracking for active users and unique sessions
	presence: defineTable({
		sessionId: v.string(),
		lastSeen: v.number(),
	})
		.index("by_session", ["sessionId"])
		.index("by_last_seen", ["lastSeen"]),
});
