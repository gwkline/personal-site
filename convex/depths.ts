"use node";

/* eslint-disable max-classes-per-file */

import { v } from "convex/values";
import { Context, Effect, Layer, Match, Schema } from "effect";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";

const INITIALS_BLOCKLIST = new Set(["ASS", "FUK", "KKK", "SEX", "XXX"]);
const MAX_LEADERBOARD_LIMIT = 50;

const ModeSchema = Schema.Literals(["standard", "daily"]);
type Mode = typeof ModeSchema.Type;

const StartInputSchema = Schema.Struct({
  mode: ModeSchema,
  requestedSeed: Schema.Int,
  sessionId: Schema.String,
});

const CheckpointInputSchema = Schema.Struct({
  elapsedMs: Schema.Number,
  floor: Schema.Int,
  runId: Schema.String,
  score: Schema.Int,
  sessionId: Schema.String,
});

const FinishInputSchema = Schema.Struct({
  durationMs: Schema.Number,
  floor: Schema.Int,
  initials: Schema.String,
  runId: Schema.String,
  score: Schema.Int,
  sessionId: Schema.String,
});

class LeaderboardProtocolError extends Schema.TaggedErrorClass<LeaderboardProtocolError>()(
  "LeaderboardProtocolError",
  {
    message: Schema.String,
  }
) {}

class LeaderboardSubmissionError extends Schema.TaggedErrorClass<LeaderboardSubmissionError>()(
  "LeaderboardSubmissionError",
  {
    message: Schema.String,
  }
) {}

interface DepthsReaderShape {
  readonly getRun: (
    runId: Id<"depthsRuns">
  ) => Effect.Effect<Doc<"depthsRuns"> | null, LeaderboardProtocolError>;
  readonly getScoreForRun: (
    runId: Id<"depthsRuns">
  ) => Effect.Effect<Doc<"depthsScores"> | null, LeaderboardProtocolError>;
  readonly listRecentRuns: (
    sessionId: string
  ) => Effect.Effect<readonly Doc<"depthsRuns">[], LeaderboardProtocolError>;
  readonly listScores: (
    limit: number
  ) => Effect.Effect<readonly Doc<"depthsScores">[], LeaderboardProtocolError>;
}

class DepthsReader extends Context.Service<DepthsReader, DepthsReaderShape>()(
  "depths/convex/Reader"
) {}

interface RunPatch {
  readonly completedAt?: number;
  readonly lastCheckpointAt: number;
  readonly maxFloor: number;
  readonly maxScore: number;
  readonly status: "active" | "completed";
}

interface DepthsWriterShape {
  readonly insertRun: (value: {
    readonly issuedAt: number;
    readonly seed: number;
    readonly sessionId: string;
  }) => Effect.Effect<Id<"depthsRuns">, LeaderboardProtocolError>;
  readonly insertScore: (
    value: Omit<Doc<"depthsScores">, "_creationTime" | "_id">
  ) => Effect.Effect<Id<"depthsScores">, LeaderboardProtocolError>;
  readonly patchRun: (
    runId: Id<"depthsRuns">,
    value: RunPatch
  ) => Effect.Effect<void, LeaderboardProtocolError>;
  readonly removeScore: (
    scoreId: Id<"depthsScores">
  ) => Effect.Effect<void, LeaderboardProtocolError>;
}

class DepthsWriter extends Context.Service<DepthsWriter, DepthsWriterShape>()(
  "depths/convex/Writer"
) {}

const protocolError = (operation: string, error: unknown) =>
  new LeaderboardProtocolError({
    message: `${operation}: ${
      error instanceof Error ? error.message : "backend operation failed"
    }`,
  });

const readerLayer = (ctx: ActionCtx): Layer.Layer<DepthsReader> =>
  Layer.succeed(DepthsReader, {
    getRun: (runId) =>
      Effect.tryPromise({
        catch: (error) => protocolError("get run", error),
        try: () => ctx.runQuery(internal.depthsData.getRun, { runId }),
      }),
    getScoreForRun: (runId) =>
      Effect.tryPromise({
        catch: (error) => protocolError("get score", error),
        try: () => ctx.runQuery(internal.depthsData.getScoreForRun, { runId }),
      }),
    listRecentRuns: (sessionId) =>
      Effect.tryPromise({
        catch: (error) => protocolError("list recent runs", error),
        try: () =>
          ctx.runQuery(internal.depthsData.listRecentRuns, { sessionId }),
      }),
    listScores: (limit) =>
      Effect.tryPromise({
        catch: (error) => protocolError("list scores", error),
        try: () => ctx.runQuery(internal.depthsData.listScores, { limit }),
      }),
  });

const writerLayer = (ctx: ActionCtx): Layer.Layer<DepthsWriter> =>
  Layer.succeed(DepthsWriter, {
    insertRun: (value) =>
      Effect.tryPromise({
        catch: (error) => protocolError("insert run", error),
        try: () => ctx.runMutation(internal.depthsData.insertRun, value),
      }),
    insertScore: (value) =>
      Effect.tryPromise({
        catch: (error) => protocolError("insert score", error),
        try: () => ctx.runMutation(internal.depthsData.insertScore, value),
      }),
    patchRun: (runId, value) =>
      Effect.tryPromise({
        catch: (error) => protocolError("patch run", error),
        try: async () => {
          await ctx.runMutation(internal.depthsData.patchRun, {
            ...value,
            runId,
          });
        },
      }),
    removeScore: (scoreId) =>
      Effect.tryPromise({
        catch: (error) => protocolError("remove score", error),
        try: async () => {
          await ctx.runMutation(internal.depthsData.removeScore, { scoreId });
        },
      }),
  });

const decode = <S extends Schema.Top>(
  schema: S,
  input: unknown
): Effect.Effect<
  S["Type"],
  LeaderboardSubmissionError,
  S["DecodingServices"]
> =>
  Schema.decodeUnknownEffect(schema)(input).pipe(
    Effect.mapError(
      () =>
        new LeaderboardSubmissionError({
          message: "The submitted run data was invalid.",
        })
    )
  );

const assertSessionId = (sessionId: string) =>
  sessionId.length >= 8 &&
  sessionId.length <= 100 &&
  /^[a-zA-Z0-9-]+$/u.test(sessionId)
    ? Effect.succeed(sessionId)
    : Effect.fail(
        new LeaderboardSubmissionError({
          message: "The arcade session is invalid.",
        })
      );

const seedFor = (mode: Mode, sessionId: string, now: number): number =>
  Match.value(mode).pipe(
    Match.when("daily", () => Math.floor(now / 86_400_000)),
    Match.when("standard", () => {
      const sessionHash = [...sessionId].reduce(
        (hash, character) =>
          (hash * 31 + (character.codePointAt(0) ?? 0)) % 2_147_483_647,
        17
      );
      return Math.abs((sessionHash + Math.trunc(now)) % 2_147_483_647);
    }),
    Match.exhaustive
  );

const parseRunId = (
  value: string
): Effect.Effect<Id<"depthsRuns">, LeaderboardSubmissionError> =>
  value.length > 0
    ? Effect.succeed(value as Id<"depthsRuns">)
    : Effect.fail(
        new LeaderboardSubmissionError({ message: "The run ID is invalid." })
      );

const validateProgress = (floor: number, score: number, elapsedMs: number) => {
  const valid =
    Number.isInteger(floor) &&
    floor >= 1 &&
    floor <= 10_000 &&
    Number.isInteger(score) &&
    score >= 0 &&
    score <= floor * 75_000 &&
    elapsedMs >= Math.max(0, (floor - 1) * 3000) &&
    elapsedMs <= 86_400_000;
  return valid
    ? Effect.void
    : Effect.fail(
        new LeaderboardSubmissionError({
          message: "The run was outside the accepted score bounds.",
        })
      );
};

const listProgram = (limit: number, seed?: number) =>
  Effect.gen(function* listLeaderboard() {
    const reader = yield* DepthsReader;
    const scores = yield* reader.listScores(
      Math.min(MAX_LEADERBOARD_LIMIT * 4, Math.max(1, limit * 4))
    );
    const filtered =
      seed === undefined
        ? scores
        : scores.filter((entry) => entry.seed === seed);
    return filtered.slice(0, Math.min(limit, MAX_LEADERBOARD_LIMIT));
  });

const startProgram = (input: unknown, now: number) =>
  Effect.gen(function* startLeaderboardRun() {
    const args = yield* decode(StartInputSchema, input);
    yield* assertSessionId(args.sessionId);
    const reader = yield* DepthsReader;
    const writer = yield* DepthsWriter;
    const [latest] = yield* reader.listRecentRuns(args.sessionId);
    if (latest && now - latest.issuedAt < 3000) {
      return yield* new LeaderboardSubmissionError({
        message: "Please wait before starting another ranked run.",
      });
    }
    const seed =
      args.mode === "daily"
        ? seedFor(args.mode, args.sessionId, now)
        : Math.abs(args.requestedSeed % 2_147_483_647);
    const runId = yield* writer.insertRun({
      issuedAt: now,
      seed,
      sessionId: args.sessionId,
    });
    return { issuedAt: now, runId: String(runId), seed };
  });

const checkpointProgram = (input: unknown, now: number) =>
  Effect.gen(function* checkpointLeaderboardRun() {
    const args = yield* decode(CheckpointInputSchema, input);
    yield* assertSessionId(args.sessionId);
    yield* validateProgress(args.floor, args.score, args.elapsedMs);
    const runId = yield* parseRunId(args.runId);
    const reader = yield* DepthsReader;
    const writer = yield* DepthsWriter;
    const run = yield* reader.getRun(runId);
    if (
      !run ||
      run.status !== "active" ||
      run.sessionId !== args.sessionId ||
      args.floor > run.maxFloor + 1 ||
      args.score < run.maxScore
    ) {
      return yield* new LeaderboardSubmissionError({
        message: "This run can no longer accept checkpoints.",
      });
    }
    yield* writer.patchRun(runId, {
      lastCheckpointAt: now,
      maxFloor: Math.max(run.maxFloor, args.floor),
      maxScore: Math.max(run.maxScore, args.score),
      status: "active",
    });
    return { accepted: true };
  });

const finishProgram = (input: unknown, now: number) =>
  Effect.gen(function* finishLeaderboardRun() {
    const args = yield* decode(FinishInputSchema, input);
    yield* assertSessionId(args.sessionId);
    yield* validateProgress(args.floor, args.score, args.durationMs);
    const initials = args.initials.trim().toUpperCase();
    if (!/^[A-Z]{3}$/u.test(initials) || INITIALS_BLOCKLIST.has(initials)) {
      return yield* new LeaderboardSubmissionError({
        message: "Enter three arcade-safe initials.",
      });
    }
    const runId = yield* parseRunId(args.runId);
    const reader = yield* DepthsReader;
    const writer = yield* DepthsWriter;
    const run = yield* reader.getRun(runId);
    const existing = yield* reader.getScoreForRun(runId);
    if (
      !run ||
      existing ||
      run.status !== "active" ||
      run.sessionId !== args.sessionId ||
      args.floor > run.maxFloor + 1 ||
      args.score < run.maxScore
    ) {
      return yield* new LeaderboardSubmissionError({
        message: "This run is not eligible for the leaderboard.",
      });
    }
    const scoreId = yield* writer.insertScore({
      createdAt: now,
      durationMs: args.durationMs,
      floor: args.floor,
      initials,
      runId,
      score: args.score,
      seed: run.seed,
    });
    yield* writer.patchRun(runId, {
      completedAt: now,
      lastCheckpointAt: now,
      maxFloor: Math.max(run.maxFloor, args.floor),
      maxScore: Math.max(run.maxScore, args.score),
      status: "completed",
    });
    return { accepted: true, scoreId };
  });

const programLayer = (
  ctx: ActionCtx
): Layer.Layer<DepthsReader | DepthsWriter> =>
  Layer.merge(readerLayer(ctx), writerLayer(ctx));

export const list = action({
  args: {
    limit: v.optional(v.number()),
    seed: v.optional(v.number()),
  },
  handler: (ctx, args) =>
    Effect.runPromise(
      listProgram(args.limit ?? 10, args.seed).pipe(
        Effect.provide(readerLayer(ctx))
      )
    ),
});

export const startRun = action({
  args: {
    mode: v.union(v.literal("standard"), v.literal("daily")),
    requestedSeed: v.number(),
    sessionId: v.string(),
  },
  handler: (ctx, args) =>
    Effect.runPromise(
      startProgram(args, Date.now()).pipe(Effect.provide(programLayer(ctx)))
    ),
});

export const checkpoint = action({
  args: {
    elapsedMs: v.number(),
    floor: v.number(),
    runId: v.string(),
    score: v.number(),
    sessionId: v.string(),
  },
  handler: (ctx, args) =>
    Effect.runPromise(
      checkpointProgram(args, Date.now()).pipe(
        Effect.provide(programLayer(ctx))
      )
    ),
});

export const finishRun = action({
  args: {
    durationMs: v.number(),
    floor: v.number(),
    initials: v.string(),
    runId: v.string(),
    score: v.number(),
    sessionId: v.string(),
  },
  handler: (ctx, args) =>
    Effect.runPromise(
      finishProgram(args, Date.now()).pipe(Effect.provide(programLayer(ctx)))
    ),
});

export const removeScore = action({
  args: {
    scoreId: v.id("depthsScores"),
  },
  handler: (ctx, args) =>
    Effect.runPromise(
      Effect.gen(function* removeLeaderboardScore() {
        const writer = yield* DepthsWriter;
        return yield* writer.removeScore(args.scoreId);
      }).pipe(Effect.provide(writerLayer(ctx)))
    ),
});
