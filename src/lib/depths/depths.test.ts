import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

import { generateFloor } from "@/lib/depths/generation";
import {
  GameStateSchema,
  InvalidTransitionError,
  RoomIdSchema,
  SeedSchema,
} from "@/lib/depths/schema";
import type { DungeonFloor, RoomId } from "@/lib/depths/schema";
import {
  applyCommand,
  GameSimulation,
  makeRunState,
} from "@/lib/depths/simulation";

const isExitReachable = (floor: DungeonFloor): boolean => {
  const visited = new Set<RoomId>();
  const queue: RoomId[] = [floor.startRoomId];
  while (queue.length > 0) {
    const roomId = queue.shift();
    if (roomId === undefined) {
      continue;
    }
    if (roomId === floor.exitRoomId) {
      return true;
    }
    if (visited.has(roomId)) {
      continue;
    }
    visited.add(roomId);
    const room = floor.rooms.find((candidate) => candidate.id === roomId);
    if (room) {
      queue.push(...room.exits);
    }
  }
  return false;
};

describe("Depths generation", () => {
  it.effect("is deterministic and always connects start to exit", () =>
    Effect.gen(function* deterministicGeneration() {
      const seed = SeedSchema.make(20_260_718);
      const first = yield* generateFloor(seed, 7);
      const second = yield* generateFloor(seed, 7);

      expect(first).toEqual(second);
      expect(first.rooms).toHaveLength(8);
      expect(isExitReachable(first)).toBe(true);
    })
  );

  it.effect("round-trips generated state through Effect Schema", () =>
    Effect.gen(function* schemaRoundTrip() {
      const seed = SeedSchema.make(42);
      const floor = yield* generateFloor(seed, 1);
      const state = makeRunState(floor, seed, 1000);
      const encoded = yield* Schema.encodeEffect(GameStateSchema)(state);
      const decoded =
        yield* Schema.decodeUnknownEffect(GameStateSchema)(encoded);

      expect(decoded).toEqual(state);
    })
  );
});

describe("Depths simulation", () => {
  it.effect("rejects commands that do not belong to the current phase", () =>
    Effect.gen(function* rejectInvalidCommand() {
      const seed = SeedSchema.make(7);
      const floor = yield* generateFloor(seed, 1);
      const state = makeRunState(floor, seed, 0);
      const exit = yield* Effect.flip(
        applyCommand(state, { _tag: "ChooseRelic", relic: "ember-edge" })
      );

      expect(exit).toBeInstanceOf(InvalidTransitionError);
      expect(exit.phase).toBe("Exploring");
    })
  );

  it.effect("pauses and resumes without losing the active phase", () =>
    Effect.gen(function* pauseAndResume() {
      const seed = SeedSchema.make(9);
      const floor = yield* generateFloor(seed, 1);
      const state = makeRunState(floor, seed, 0);
      const paused = yield* applyCommand(state, { _tag: "Pause" });
      const resumed = yield* applyCommand(paused, { _tag: "Resume" });

      expect(paused.phase._tag).toBe("Paused");
      expect(resumed.phase).toEqual(state.phase);
    })
  );

  it.effect("ends a run when combat pressure removes the last health", () =>
    Effect.gen(function* combatPressure() {
      const seed = SeedSchema.make(11);
      const floor = yield* generateFloor(seed, 1);
      const state = makeRunState(floor, seed, 0);
      const fighting = {
        ...state,
        elapsedMs: 1199,
        enemies: [
          {
            hp: 1,
            id: "test-enemy",
            kind: "slime" as const,
            position: state.player,
          },
        ],
        hp: 1,
        phase: {
          _tag: "Fighting" as const,
          roomId: floor.startRoomId,
          startedAt: 0,
        },
      };
      const finished = yield* applyCommand(fighting, {
        _tag: "Tick",
        deltaMs: 1,
      });

      expect(finished.hp).toBe(0);
      expect(finished.phase._tag).toBe("GameOver");
    })
  );

  it.effect("marks reward rooms cleared so relics cannot be farmed", () =>
    Effect.gen(function* rewardRoomsPersistClearance() {
      const seed = SeedSchema.make(21);
      const base = yield* generateFloor(seed, 1);
      const rewardId = RoomIdSchema.make(99);
      const floor = {
        ...base,
        rooms: [
          ...base.rooms.map((room) =>
            room.id === base.startRoomId
              ? {
                  ...room,
                  exits: [...new Set([...room.exits, rewardId])],
                }
              : room
          ),
          {
            cleared: false,
            depth: 1,
            exits: [base.startRoomId],
            id: rewardId,
            kind: "reward" as const,
            position: { x: 0, y: 0 },
          },
        ],
      };
      const fromStart = makeRunState(floor, seed, 0);
      const choosing = yield* applyCommand(fromStart, {
        _tag: "EnterRoom",
        now: 10,
        roomId: rewardId,
      });
      expect(choosing.phase._tag).toBe("ChoosingReward");

      const afterPick = yield* applyCommand(choosing, {
        _tag: "ChooseRelic",
        relic:
          choosing.phase._tag === "ChoosingReward"
            ? choosing.phase.choices[0]
            : "ember-edge",
      });
      expect(afterPick.phase._tag).toBe("Exploring");
      expect(
        afterPick.floor.rooms.find((room) => room.id === rewardId)?.cleared
      ).toBe(true);

      const left = yield* applyCommand(afterPick, {
        _tag: "EnterRoom",
        now: 15,
        roomId: floor.startRoomId,
      });
      const reenter = yield* applyCommand(left, {
        _tag: "EnterRoom",
        now: 20,
        roomId: rewardId,
      });
      expect(reenter.phase._tag).toBe("Exploring");
      expect(reenter.relics).toEqual(afterPick.relics);
    })
  );

  it.effect("only danger combat clears into a relic choice", () =>
    Effect.gen(function* combatRelicGating() {
      const seed = SeedSchema.make(33);
      const base = yield* generateFloor(seed, 1);
      const combatId = RoomIdSchema.make(91);
      const dangerId = RoomIdSchema.make(92);
      const floor = {
        ...base,
        rooms: [
          ...base.rooms,
          {
            cleared: false,
            depth: 2,
            exits: [],
            id: combatId,
            kind: "combat" as const,
            position: { x: 1, y: 1 },
          },
          {
            cleared: false,
            depth: 2,
            exits: [],
            id: dangerId,
            kind: "danger" as const,
            position: { x: 2, y: 2 },
          },
        ],
      };

      const combatCleared = yield* applyCommand(
        {
          ...makeRunState(floor, seed, 0),
          currentRoomId: combatId,
          enemies: [
            {
              hp: 1,
              id: "solo",
              kind: "slime" as const,
              position: { x: 10, y: 6 },
            },
          ],
          phase: {
            _tag: "Fighting" as const,
            roomId: combatId,
            startedAt: 0,
          },
          player: { x: 10, y: 6 },
        },
        { _tag: "Attack" }
      );
      expect(combatCleared.phase._tag).toBe("Exploring");
      expect(combatCleared.enemies).toHaveLength(0);

      const dangerCleared = yield* applyCommand(
        {
          ...makeRunState(floor, seed, 0),
          currentRoomId: dangerId,
          enemies: [
            {
              hp: 1,
              id: "solo-danger",
              kind: "wisp" as const,
              position: { x: 10, y: 6 },
            },
          ],
          phase: {
            _tag: "Fighting" as const,
            roomId: dangerId,
            startedAt: 0,
          },
          player: { x: 10, y: 6 },
        },
        { _tag: "Attack" }
      );
      expect(dangerCleared.phase._tag).toBe("ChoosingReward");
    })
  );

  it.effect("keeps movement inside room walls", () =>
    Effect.gen(function* roomCollision() {
      const seed = SeedSchema.make(12);
      const floor = yield* generateFloor(seed, 1);
      const state = {
        ...makeRunState(floor, seed, 0),
        player: { x: 10, y: 1 },
      };
      const moved = yield* applyCommand(state, {
        _tag: "Move",
        direction: "up",
      });

      expect(moved.player.y).toBe(1);
      expect(moved.currentRoomId).toBe(floor.startRoomId);
    })
  );

  it.layer(GameSimulation.layer)("service layer", (layerIt) => {
    layerIt.effect("starts deterministic runs through the service graph", () =>
      Effect.gen(function* simulationService() {
        const simulation = yield* GameSimulation;
        const seed = SeedSchema.make(123);
        const started = yield* simulation.start(seed, 500);
        const snapshot = yield* simulation.snapshot;

        expect(snapshot).toEqual(started);
        expect(snapshot.floor.floor).toBe(1);
        expect(snapshot.phase._tag).toBe("Exploring");
      })
    );
  });
});
