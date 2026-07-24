/* eslint-disable max-classes-per-file */

import * as Schema from "effect/Schema";

export const RunIdSchema = Schema.String.pipe(Schema.brand("DepthsRunId"));
export type RunId = typeof RunIdSchema.Type;

export const SeedSchema = Schema.Int.pipe(Schema.brand("DepthsSeed"));
export type Seed = typeof SeedSchema.Type;

export const RoomIdSchema = Schema.Int.pipe(Schema.brand("DepthsRoomId"));
export type RoomId = typeof RoomIdSchema.Type;

export const DirectionSchema = Schema.Literals(["up", "down", "left", "right"]);
export type Direction = typeof DirectionSchema.Type;

export const RoomKindSchema = Schema.Literals([
  "start",
  "combat",
  "danger",
  "reward",
  "healing",
  "mystery",
  "exit",
]);
export type RoomKind = typeof RoomKindSchema.Type;

export const RelicKindSchema = Schema.Literals([
  "ember-edge",
  "ember-heart",
  "moss-guard",
  "moss-bloom",
  "echo-step",
  "echo-lens",
]);
export type RelicKind = typeof RelicKindSchema.Type;

export const GameOverReasonSchema = Schema.Literals([
  "defeated",
  "abandoned",
  "invalid-run",
]);
export type GameOverReason = typeof GameOverReasonSchema.Type;

export const VectorSchema = Schema.Struct({
  x: Schema.Number,
  y: Schema.Number,
});
export type Vector = typeof VectorSchema.Type;

export const RoomSchema = Schema.Struct({
  cleared: Schema.Boolean,
  depth: Schema.Int,
  exits: Schema.Array(RoomIdSchema),
  id: RoomIdSchema,
  kind: RoomKindSchema,
  position: VectorSchema,
});
export type Room = typeof RoomSchema.Type;

export const DungeonFloorSchema = Schema.Struct({
  exitRoomId: RoomIdSchema,
  floor: Schema.Int,
  rooms: Schema.Array(RoomSchema),
  seed: SeedSchema,
  startRoomId: RoomIdSchema,
});
export type DungeonFloor = typeof DungeonFloorSchema.Type;

export const ActivePhaseSchema = Schema.Union([
  Schema.TaggedStruct("Exploring", {
    roomId: RoomIdSchema,
  }),
  Schema.TaggedStruct("Fighting", {
    roomId: RoomIdSchema,
    startedAt: Schema.Number,
  }),
  Schema.TaggedStruct("ChoosingReward", {
    choices: Schema.Array(RelicKindSchema),
    roomId: RoomIdSchema,
  }),
]);
export type ActivePhase = typeof ActivePhaseSchema.Type;

export const GamePhaseSchema = Schema.Union([
  Schema.TaggedStruct("Title", {}),
  ...ActivePhaseSchema.members,
  Schema.TaggedStruct("Paused", {
    previous: ActivePhaseSchema,
  }),
  Schema.TaggedStruct("GameOver", {
    finalFloor: Schema.Int,
    finalScore: Schema.Int,
    reason: GameOverReasonSchema,
  }),
]);
export type GamePhase = typeof GamePhaseSchema.Type;

export const EnemySchema = Schema.Struct({
  hp: Schema.Number,
  id: Schema.String,
  kind: Schema.Literals(["slime", "wisp", "sentinel"]),
  position: VectorSchema,
});
export type Enemy = typeof EnemySchema.Type;

export const GameStateSchema = Schema.Struct({
  attack: Schema.Number,
  combo: Schema.Int,
  currentRoomId: RoomIdSchema,
  dashCooldownMs: Schema.Number,
  dread: Schema.Int,
  elapsedMs: Schema.Number,
  enemies: Schema.Array(EnemySchema),
  facing: DirectionSchema,
  floor: DungeonFloorSchema,
  hp: Schema.Number,
  lastAttackMs: Schema.Number,
  lastDodgeMs: Schema.Number,
  maxHp: Schema.Number,
  phase: GamePhaseSchema,
  player: VectorSchema,
  relics: Schema.Array(RelicKindSchema),
  runId: RunIdSchema,
  score: Schema.Int,
  startedAt: Schema.Number,
});
export type GameState = typeof GameStateSchema.Type;

export const GameCommandSchema = Schema.Union([
  Schema.TaggedStruct("Move", {
    direction: DirectionSchema,
  }),
  Schema.TaggedStruct("EnterRoom", {
    now: Schema.Number,
    roomId: RoomIdSchema,
  }),
  Schema.TaggedStruct("Attack", {}),
  Schema.TaggedStruct("Dodge", {}),
  Schema.TaggedStruct("TakeDamage", {
    amount: Schema.Number,
  }),
  Schema.TaggedStruct("ChooseRelic", {
    relic: RelicKindSchema,
  }),
  Schema.TaggedStruct("Pause", {}),
  Schema.TaggedStruct("Resume", {}),
  Schema.TaggedStruct("Tick", {
    deltaMs: Schema.Number,
  }),
  Schema.TaggedStruct("EndRun", {
    reason: GameOverReasonSchema,
  }),
]);
export type GameCommand = typeof GameCommandSchema.Type;

export const LeaderboardEntrySchema = Schema.Struct({
  createdAt: Schema.Number,
  durationMs: Schema.Number,
  floor: Schema.Int,
  initials: Schema.String,
  score: Schema.Int,
  seed: SeedSchema,
});
export type LeaderboardEntry = typeof LeaderboardEntrySchema.Type;

export const RunReceiptSchema = Schema.Struct({
  issuedAt: Schema.Number,
  runId: RunIdSchema,
  seed: SeedSchema,
});
export type RunReceipt = typeof RunReceiptSchema.Type;

export class GenerationError extends Schema.TaggedErrorClass<GenerationError>()(
  "GenerationError",
  {
    message: Schema.String,
    seed: Schema.Number,
  }
) {}

export class InvalidTransitionError extends Schema.TaggedErrorClass<InvalidTransitionError>()(
  "InvalidTransitionError",
  {
    command: Schema.String,
    phase: Schema.String,
  }
) {}

export class RenderingError extends Schema.TaggedErrorClass<RenderingError>()(
  "RenderingError",
  {
    message: Schema.String,
  }
) {}

export class StorageError extends Schema.TaggedErrorClass<StorageError>()(
  "StorageError",
  {
    message: Schema.String,
    operation: Schema.String,
  }
) {}

export class SubmissionError extends Schema.TaggedErrorClass<SubmissionError>()(
  "SubmissionError",
  {
    message: Schema.String,
    retryable: Schema.Boolean,
  }
) {}

export class ProtocolError extends Schema.TaggedErrorClass<ProtocolError>()(
  "ProtocolError",
  {
    message: Schema.String,
  }
) {}
