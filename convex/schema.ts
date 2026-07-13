import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Comments table for blog posts and global comments
  comments: defineTable({
    content: v.string(),
    createdAt: v.number(),
    // For threading and replies.
    parentId: v.optional(v.id("comments")),
    // Optional for global comments.
    postSlug: v.optional(v.string()),
    // Denormalized count for performance.
    replyCount: v.optional(v.number()),
    userId: v.string(),
    userImage: v.optional(v.string()),
    userName: v.string(),
  })
    .index("by_post", ["postSlug"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"])
    .index("by_parent", ["parentId"]),
  // Presence tracking for active users and unique sessions
  presence: defineTable({
    lastSeen: v.number(),
    sessionId: v.string(),
  })
    .index("by_session", ["sessionId"])
    .index("by_last_seen", ["lastSeen"]),
  // Reactions table for comments
  reactions: defineTable({
    commentId: v.id("comments"),
    createdAt: v.number(),
    // For example: "👍", "❤️", "🔥", "😂", "🎉", "🤔".
    emoji: v.string(),
    userId: v.string(),
  })
    .index("by_comment", ["commentId"])
    .index("by_user_comment", ["userId", "commentId"]),
});
