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
  depthsRuns: defineTable({
    completedAt: v.optional(v.number()),
    issuedAt: v.number(),
    lastCheckpointAt: v.number(),
    maxFloor: v.number(),
    maxScore: v.number(),
    seed: v.number(),
    sessionId: v.string(),
    status: v.union(v.literal("active"), v.literal("completed")),
  })
    .index("by_issued", ["issuedAt"])
    .index("by_session", ["sessionId", "issuedAt"]),
  depthsScores: defineTable({
    createdAt: v.number(),
    durationMs: v.number(),
    floor: v.number(),
    initials: v.string(),
    runId: v.id("depthsRuns"),
    score: v.number(),
    seed: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_run", ["runId"])
    .index("by_score", ["score"]),
  // Cached snapshot of public GitHub activity, refreshed by cron.
  githubSnapshots: defineTable({
    events: v.array(
      v.object({
        createdAt: v.number(),
        id: v.string(),
        kind: v.string(),
        message: v.string(),
        repo: v.string(),
        url: v.optional(v.string()),
      })
    ),
    fetchedAt: v.number(),
    key: v.string(),
    repos: v.array(
      v.object({
        description: v.optional(v.string()),
        language: v.optional(v.string()),
        name: v.string(),
        pushedAt: v.number(),
        stars: v.number(),
        url: v.string(),
      })
    ),
  }).index("by_key", ["key"]),
  // Gym tracker: audit log for every LLM coach call.
  gymCoachLogs: defineTable({
    attempt: v.number(),
    completionTokens: v.optional(v.number()),
    createdAt: v.number(),
    errorMessage: v.optional(v.string()),
    instruction: v.optional(v.string()),
    kind: v.string(),
    model: v.string(),
    promptTokens: v.optional(v.number()),
    requestJson: v.string(),
    responseJson: v.optional(v.string()),
    status: v.string(),
  }).index("by_created", ["createdAt"]),
  // Gym tracker: goals tracked against session data, progress computed read-side.
  gymGoals: defineTable({
    createdAt: v.number(),
    deadline: v.union(v.string(), v.null()),
    metric: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("achieved"),
      v.literal("retired")
    ),
    targetValue: v.number(),
    title: v.string(),
    unit: v.string(),
    updatedAt: v.number(),
  }).index("by_status", ["status", "createdAt"]),
  // Gym tracker: versioned weekly plan templates. One active at a time.
  // Nullable fields are required-but-null (v.union(..., v.null())) so stored
  // docs match the src/lib/gym domain types exactly.
  gymPlans: defineTable({
    active: v.boolean(),
    createdAt: v.number(),
    days: v.array(
      v.object({
        dayOfWeek: v.number(),
        items: v.array(
          v.object({
            distanceKm: v.union(v.number(), v.null()),
            durationMin: v.union(v.number(), v.null()),
            incrementKg: v.union(v.number(), v.null()),
            intensity: v.union(
              v.literal("easy"),
              v.literal("steady"),
              v.literal("tempo"),
              v.literal("intervals"),
              v.null()
            ),
            name: v.string(),
            notes: v.union(v.string(), v.null()),
            repMax: v.union(v.number(), v.null()),
            repMin: v.union(v.number(), v.null()),
            sets: v.union(v.number(), v.null()),
            targetWeightKg: v.union(v.number(), v.null()),
          })
        ),
        kind: v.union(
          v.literal("lift"),
          v.literal("run"),
          v.literal("rest"),
          v.literal("cross-train")
        ),
        title: v.string(),
      })
    ),
    name: v.string(),
    reason: v.string(),
    updatedAt: v.number(),
    version: v.number(),
  }).index("by_active", ["active"]),
  // Gym tracker: what actually happened. One doc per logged session.
  gymSessions: defineTable({
    createdAt: v.number(),
    date: v.string(),
    dayOfWeek: v.number(),
    entries: v.array(
      v.object({
        distanceKm: v.union(v.number(), v.null()),
        durationMin: v.union(v.number(), v.null()),
        name: v.string(),
        notes: v.union(v.string(), v.null()),
        sets: v.array(
          v.object({
            reps: v.union(v.number(), v.null()),
            weightKg: v.union(v.number(), v.null()),
          })
        ),
      })
    ),
    kind: v.union(
      v.literal("lift"),
      v.literal("run"),
      v.literal("cross-train")
    ),
    notes: v.union(v.string(), v.null()),
    planVersion: v.union(v.number(), v.null()),
    rpe: v.union(v.number(), v.null()),
    skipped: v.boolean(),
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_created", ["createdAt"]),
  // Gym tracker: singleton settings doc (key "primary").
  gymSettings: defineTable({
    key: v.string(),
    nudgeEnabled: v.boolean(),
    nudgeTime: v.string(),
    nudgeTo: v.optional(v.string()),
    timezone: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
  hard75Challenges: defineTable({
    createdAt: v.number(),
    endDate: v.string(),
    slug: v.string(),
    startDate: v.string(),
    timezone: v.string(),
    title: v.string(),
    totalDays: v.number(),
  }).index("by_slug", ["slug"]),
  hard75Days: defineTable({
    challengeId: v.id("hard75Challenges"),
    date: v.string(),
    dayIndex: v.number(),
    diet: v.boolean(),
    note: v.optional(v.string()),
    outdoors: v.boolean(),
    photoPublic: v.boolean(),
    photoStorageId: v.optional(v.id("_storage")),
    // Whether a progress photo was taken (uploading it here stays optional).
    progressPhoto: v.optional(v.boolean()),
    publicPhotoStorageId: v.optional(v.id("_storage")),
    reading: v.boolean(),
    runMiles: v.optional(v.number()),
    updatedAt: v.number(),
    water: v.boolean(),
    workoutOne: v.boolean(),
    workoutTwo: v.boolean(),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_challenge_day", ["challengeId", "dayIndex"]),
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
