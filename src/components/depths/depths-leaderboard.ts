import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";

import {
  LeaderboardEntrySchema,
  RunReceiptSchema,
  StorageError,
  SubmissionError,
} from "@/lib/depths/schema";
import type { LeaderboardEntry, RunReceipt } from "@/lib/depths/schema";

export interface LeaderboardActions {
  readonly checkpoint: (input: {
    readonly elapsedMs: number;
    readonly floor: number;
    readonly runId: string;
    readonly score: number;
    readonly sessionId: string;
  }) => Promise<unknown>;
  readonly finish: (input: {
    readonly durationMs: number;
    readonly floor: number;
    readonly initials: string;
    readonly runId: string;
    readonly score: number;
    readonly sessionId: string;
  }) => Promise<unknown>;
  readonly list: (input: {
    readonly limit?: number;
    readonly seed?: number;
  }) => Promise<unknown>;
  readonly start: (input: {
    readonly mode: "daily" | "standard";
    readonly requestedSeed: number;
    readonly sessionId: string;
  }) => Promise<unknown>;
}

export type ScoreSubmission = Parameters<LeaderboardActions["finish"]>[0];

const AcceptedSchema = Schema.Struct({
  accepted: Schema.Boolean,
});

const LeaderboardListSchema = Schema.Array(LeaderboardEntrySchema);
const ScoreSubmissionSchema = Schema.Struct({
  durationMs: Schema.Number,
  floor: Schema.Int,
  initials: Schema.String,
  runId: Schema.String,
  score: Schema.Int,
  sessionId: Schema.String,
});

const retrySchedule = Schedule.exponential("250 millis").pipe(
  Schedule.upTo({ duration: "2 seconds", times: 4 })
);

const request = (operation: string, thunk: () => Promise<unknown>) =>
  Effect.tryPromise({
    catch: (error) =>
      new SubmissionError({
        message:
          error instanceof Error
            ? error.message
            : `${operation} could not reach the arcade.`,
        retryable: true,
      }),
    try: thunk,
  }).pipe(Effect.retry(retrySchedule));

const decodeResponse = <S extends Schema.Top>(
  schema: S,
  value: unknown
): Effect.Effect<S["Type"], SubmissionError, S["DecodingServices"]> =>
  Schema.decodeUnknownEffect(schema)(value).pipe(
    Effect.mapError(
      () =>
        new SubmissionError({
          message: "The arcade returned an invalid response.",
          retryable: false,
        })
    )
  );

interface LeaderboardClientShape {
  readonly checkpoint: (
    input: Parameters<LeaderboardActions["checkpoint"]>[0]
  ) => Effect.Effect<void, SubmissionError>;
  readonly finish: (
    input: Parameters<LeaderboardActions["finish"]>[0]
  ) => Effect.Effect<void, SubmissionError>;
  readonly list: (
    seed?: number
  ) => Effect.Effect<readonly LeaderboardEntry[], SubmissionError>;
  readonly start: (
    mode: "daily" | "standard",
    sessionId: string,
    requestedSeed: number
  ) => Effect.Effect<RunReceipt, SubmissionError>;
}

export class LeaderboardClient extends Context.Service<
  LeaderboardClient,
  LeaderboardClientShape
>()("depths/LeaderboardClient") {
  static layer(actions: LeaderboardActions) {
    return Layer.succeed(LeaderboardClient, {
      checkpoint: (input) =>
        request("Checkpoint", () => actions.checkpoint(input)).pipe(
          Effect.flatMap((response) =>
            decodeResponse(AcceptedSchema, response)
          ),
          Effect.asVoid
        ),
      finish: (input) =>
        request("Score submission", () => actions.finish(input)).pipe(
          Effect.flatMap((response) =>
            decodeResponse(AcceptedSchema, response)
          ),
          Effect.asVoid
        ),
      list: (seed) =>
        request("Leaderboard", () =>
          actions.list(seed === undefined ? { limit: 10 } : { limit: 10, seed })
        ).pipe(
          Effect.flatMap((response) =>
            decodeResponse(LeaderboardListSchema, response)
          )
        ),
      start: (mode, sessionId, requestedSeed) =>
        request("Run issuance", () =>
          actions.start({ mode, requestedSeed, sessionId })
        ).pipe(
          Effect.flatMap((response) =>
            decodeResponse(RunReceiptSchema, response)
          )
        ),
    });
  }
}

export const getArcadeSessionId = Effect.sync(() => {
  const storageKey = "depths-arcade-session";
  const stored = window.localStorage.getItem(storageKey);
  if (stored && /^[a-zA-Z0-9-]{8,100}$/u.test(stored)) {
    return stored;
  }
  const created = `arcade-${window.crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, created);
  return created;
});

const QUEUED_SUBMISSION_KEY = "depths-queued-score";

export const queueScoreSubmission = (input: ScoreSubmission) =>
  Effect.try({
    catch: (error) =>
      new StorageError({
        message:
          error instanceof Error ? error.message : "Could not queue score.",
        operation: "queue score",
      }),
    try: () => {
      window.localStorage.setItem(
        QUEUED_SUBMISSION_KEY,
        JSON.stringify(Schema.encodeSync(ScoreSubmissionSchema)(input))
      );
    },
  });

export const readQueuedScoreSubmission = Effect.try({
  catch: (error) =>
    new StorageError({
      message:
        error instanceof Error ? error.message : "Could not read queued score.",
      operation: "read queued score",
    }),
  try: () => window.localStorage.getItem(QUEUED_SUBMISSION_KEY),
}).pipe(
  Effect.flatMap((stored) =>
    stored
      ? Effect.try({
          catch: (error) =>
            new StorageError({
              message:
                error instanceof Error
                  ? error.message
                  : "The queued score was invalid.",
              operation: "parse queued score",
            }),
          try: () => JSON.parse(stored),
        }).pipe(
          Effect.flatMap((parsed) =>
            Schema.decodeUnknownEffect(ScoreSubmissionSchema)(parsed)
          )
        )
      : Effect.succeed(null)
  ),
  // Effect error-channel mapping is not a Promise callback.
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  Effect.mapError((error) =>
    error instanceof StorageError
      ? error
      : new StorageError({
          message: "The queued score was invalid.",
          operation: "decode queued score",
        })
  )
);

export const clearQueuedScoreSubmission = Effect.sync(() => {
  window.localStorage.removeItem(QUEUED_SUBMISSION_KEY);
});
