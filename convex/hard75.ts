import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { assertOwner, isOwner } from "./lib/owner";

const CHALLENGE = {
  endDate: "2026-09-25",
  slug: "the-long-run-2026",
  startDate: "2026-07-13",
  timezone: "America/New_York",
  title: "The Long Game",
  totalDays: 75,
} as const;

const dateForDay = (dayIndex: number) => {
  const date = new Date(`${CHALLENGE.startDate}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + dayIndex - 1);
  return date.toISOString().slice(0, 10);
};

const todayInChallengeTimezone = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: CHALLENGE.timezone,
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  return `${values.year}-${values.month}-${values.day}`;
};

const validateDay = (dayIndex: number, date: string) => {
  if (!Number.isInteger(dayIndex) || dayIndex < 1 || dayIndex > 75) {
    throw new Error("Day must be between 1 and 75");
  }
  if (date !== dateForDay(dayIndex)) {
    throw new Error("Date does not match the challenge day");
  }
  if (date > todayInChallengeTimezone()) {
    throw new Error("Future days cannot be edited");
  }
};

const getChallenge = (ctx: MutationCtx) =>
  ctx.db
    .query("hard75Challenges")
    .withIndex("by_slug", (q) => q.eq("slug", CHALLENGE.slug))
    .unique();

const ensureChallenge = async (ctx: MutationCtx) => {
  const existing = await getChallenge(ctx);
  if (existing) {
    return existing;
  }
  const challengeId = await ctx.db.insert("hard75Challenges", {
    ...CHALLENGE,
    createdAt: Date.now(),
  });
  const challenge = await ctx.db.get(challengeId);
  if (!challenge) {
    throw new Error("Unable to create challenge");
  }
  return challenge;
};

const getDay = (
  ctx: MutationCtx,
  challengeId: Id<"hard75Challenges">,
  dayIndex: number
) =>
  ctx.db
    .query("hard75Days")
    .withIndex("by_challenge_day", (q) =>
      q.eq("challengeId", challengeId).eq("dayIndex", dayIndex)
    )
    .unique();

const createEmptyDay = (
  challengeId: Id<"hard75Challenges">,
  dayIndex: number,
  date: string
) => ({
  challengeId,
  date,
  dayIndex,
  diet: false,
  outdoors: false,
  photoPublic: false,
  progressPhoto: false,
  reading: false,
  updatedAt: Date.now(),
  water: false,
  workoutOne: false,
  workoutTwo: false,
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const challenge = await ctx.db
      .query("hard75Challenges")
      .withIndex("by_slug", (q) => q.eq("slug", CHALLENGE.slug))
      .unique();
    const owner = await isOwner(ctx);
    if (!challenge) {
      return { challenge: CHALLENGE, days: [], isOwner: owner };
    }

    const records = await ctx.db
      .query("hard75Days")
      .withIndex("by_challenge", (q) => q.eq("challengeId", challenge._id))
      .collect();
    const days = await Promise.all(
      records.map(async (day) => {
        const legacyPublicPhotoId =
          day.photoPublic && day.photoStorageId
            ? day.photoStorageId
            : undefined;
        const publicPhotoId = day.publicPhotoStorageId ?? legacyPublicPhotoId;
        const [progressPhotoUrl, publicPhotoUrl] = await Promise.all([
          owner && day.photoStorageId
            ? ctx.storage.getUrl(day.photoStorageId)
            : null,
          publicPhotoId ? ctx.storage.getUrl(publicPhotoId) : null,
        ]);
        return {
          date: day.date,
          dayIndex: day.dayIndex,
          diet: day.diet,
          note: day.note,
          outdoors: day.outdoors,
          progressPhoto: day.progressPhoto ?? false,
          progressPhotoUrl,
          publicPhotoUrl,
          reading: day.reading,
          runMiles: day.runMiles,
          updatedAt: day.updatedAt,
          water: day.water,
          workoutOne: day.workoutOne,
          workoutTwo: day.workoutTwo,
        };
      })
    );
    return {
      challenge: {
        endDate: challenge.endDate,
        slug: challenge.slug,
        startDate: challenge.startDate,
        timezone: challenge.timezone,
        title: challenge.title,
        totalDays: challenge.totalDays,
      },
      days,
      isOwner: owner,
    };
  },
});

export const updateDay = mutation({
  args: {
    date: v.string(),
    dayIndex: v.number(),
    diet: v.boolean(),
    note: v.optional(v.string()),
    outdoors: v.boolean(),
    progressPhoto: v.boolean(),
    reading: v.boolean(),
    runMiles: v.optional(v.number()),
    water: v.boolean(),
    workoutOne: v.boolean(),
    workoutTwo: v.boolean(),
  },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    validateDay(args.dayIndex, args.date);
    const note = args.note?.trim();
    if (note && note.length > 500) {
      throw new Error("Notes must be 500 characters or fewer");
    }
    if (
      args.runMiles !== undefined &&
      (!Number.isFinite(args.runMiles) ||
        args.runMiles < 0 ||
        args.runMiles > 100)
    ) {
      throw new Error("Run mileage must be between 0 and 100");
    }

    const challenge = await ensureChallenge(ctx);
    const existing = await getDay(ctx, challenge._id, args.dayIndex);
    const values = {
      date: args.date,
      dayIndex: args.dayIndex,
      diet: args.diet,
      note: note || undefined,
      outdoors: args.outdoors,
      progressPhoto: args.progressPhoto,
      reading: args.reading,
      runMiles: args.runMiles,
      updatedAt: Date.now(),
      water: args.water,
      workoutOne: args.workoutOne,
      workoutTwo: args.workoutTwo,
    };
    if (existing) {
      await ctx.db.patch(existing._id, values);
      return existing._id;
    }
    return ctx.db.insert("hard75Days", {
      ...createEmptyDay(challenge._id, args.dayIndex, args.date),
      ...values,
    });
  },
});

export const generatePhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await assertOwner(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

const validatePhotoUpload = async (
  ctx: MutationCtx,
  storageId: Id<"_storage">
) => {
  const metadata = await ctx.db.system.get(storageId);
  if (
    !metadata ||
    !metadata.contentType?.startsWith("image/") ||
    metadata.size > 8 * 1024 * 1024
  ) {
    await ctx.storage.delete(storageId);
    throw new Error("Photos must be images smaller than 8 MB");
  }
};

export const saveProgressPhoto = mutation({
  args: {
    date: v.string(),
    dayIndex: v.number(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    validateDay(args.dayIndex, args.date);
    await validatePhotoUpload(ctx, args.storageId);
    const challenge = await ensureChallenge(ctx);
    const existing = await getDay(ctx, challenge._id, args.dayIndex);
    if (existing?.photoStorageId) {
      await ctx.storage.delete(existing.photoStorageId);
    }
    if (existing) {
      await ctx.db.patch(existing._id, {
        photoPublic: false,
        photoStorageId: args.storageId,
        progressPhoto: true,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return ctx.db.insert("hard75Days", {
      ...createEmptyDay(challenge._id, args.dayIndex, args.date),
      photoStorageId: args.storageId,
      progressPhoto: true,
    });
  },
});

export const savePublicPhoto = mutation({
  args: {
    date: v.string(),
    dayIndex: v.number(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    validateDay(args.dayIndex, args.date);
    await validatePhotoUpload(ctx, args.storageId);
    const challenge = await ensureChallenge(ctx);
    const existing = await getDay(ctx, challenge._id, args.dayIndex);
    if (existing?.publicPhotoStorageId) {
      await ctx.storage.delete(existing.publicPhotoStorageId);
    }
    if (existing) {
      await ctx.db.patch(existing._id, {
        photoPublic: false,
        publicPhotoStorageId: args.storageId,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return ctx.db.insert("hard75Days", {
      ...createEmptyDay(challenge._id, args.dayIndex, args.date),
      publicPhotoStorageId: args.storageId,
    });
  },
});

export const removeProgressPhoto = mutation({
  args: {
    date: v.string(),
    dayIndex: v.number(),
  },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    validateDay(args.dayIndex, args.date);
    const challenge = await ensureChallenge(ctx);
    const existing = await getDay(ctx, challenge._id, args.dayIndex);
    if (!existing?.photoStorageId) {
      return;
    }
    await ctx.storage.delete(existing.photoStorageId);
    await ctx.db.patch(existing._id, {
      photoPublic: false,
      photoStorageId: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const removePublicPhoto = mutation({
  args: {
    date: v.string(),
    dayIndex: v.number(),
  },
  handler: async (ctx, args) => {
    await assertOwner(ctx);
    validateDay(args.dayIndex, args.date);
    const challenge = await ensureChallenge(ctx);
    const existing = await getDay(ctx, challenge._id, args.dayIndex);
    if (!existing) {
      return;
    }
    if (existing.publicPhotoStorageId) {
      await ctx.storage.delete(existing.publicPhotoStorageId);
    }
    await ctx.db.patch(existing._id, {
      photoPublic: false,
      publicPhotoStorageId: undefined,
      updatedAt: Date.now(),
    });
  },
});
