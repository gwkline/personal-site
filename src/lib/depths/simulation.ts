import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import type * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";

import { DungeonGenerator } from "@/lib/depths/generation";
import {
  InvalidTransitionError,
  RoomIdSchema,
  RunIdSchema,
  SeedSchema,
} from "@/lib/depths/schema";
import type {
  ActivePhase,
  Direction,
  DungeonFloor,
  Enemy,
  GameCommand,
  GamePhase,
  GameState,
  RelicKind,
  Room,
  RoomId,
  RunId,
  Seed,
  Vector,
} from "@/lib/depths/schema";

const PLAYER_START: Vector = { x: 10, y: 6 };
const ROOM_MAX_X = 18;
const ROOM_MAX_Y = 10;
const ROOM_MIN_X = 1;
const ROOM_MIN_Y = 1;
const ENEMY_KINDS = ["slime", "wisp", "sentinel"] as const;

const makeRunId = (seed: Seed, now: number): RunId =>
  RunIdSchema.make(`depths-${seed}-${Math.trunc(now)}`);

const activePhaseTag = (phase: ActivePhase): string => phase._tag;

const exploringPhase = (roomId: RoomId): ActivePhase => ({
  _tag: "Exploring",
  roomId,
});

const fightingPhase = (roomId: RoomId, startedAt: number): ActivePhase => ({
  _tag: "Fighting",
  roomId,
  startedAt,
});

const rewardPhase = (
  roomId: RoomId,
  choices: readonly RelicKind[]
): ActivePhase => ({
  _tag: "ChoosingReward",
  choices,
  roomId,
});

const failTransition = (
  command: GameCommand["_tag"] | "Descend",
  phase: GamePhase
) =>
  Effect.fail(
    new InvalidTransitionError({
      command,
      phase: phase._tag,
    })
  );

const moveVector = (
  position: Vector,
  direction: Direction,
  distance = 0.8
): Vector =>
  Match.value(direction).pipe(
    Match.when("up", () => ({ ...position, y: position.y - distance })),
    Match.when("down", () => ({ ...position, y: position.y + distance })),
    Match.when("left", () => ({ ...position, x: position.x - distance })),
    Match.when("right", () => ({ ...position, x: position.x + distance })),
    Match.exhaustive
  );

const clampToRoom = (position: Vector): Vector => ({
  x: Math.max(ROOM_MIN_X, Math.min(ROOM_MAX_X, position.x)),
  y: Math.max(ROOM_MIN_Y, Math.min(ROOM_MAX_Y, position.y)),
});

export const directionBetweenRooms = (from: Room, to: Room): Direction => {
  const deltaX = to.position.x - from.position.x;
  const deltaY = to.position.y - from.position.y;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0 ? "right" : "left";
  }
  return deltaY >= 0 ? "down" : "up";
};

const entryPosition = (direction: Direction): Vector =>
  Match.value(direction).pipe(
    Match.when("up", () => ({ x: 10, y: ROOM_MAX_Y - 0.5 })),
    Match.when("down", () => ({ x: 10, y: ROOM_MIN_Y + 0.5 })),
    Match.when("left", () => ({ x: ROOM_MAX_X - 0.5, y: 6 })),
    Match.when("right", () => ({ x: ROOM_MIN_X + 0.5, y: 6 })),
    Match.exhaustive
  );

const findRoom = (state: GameState, roomId: RoomId): Room | undefined =>
  state.floor.rooms.find((room) => room.id === roomId);

const markRoomCleared = (
  floor: DungeonFloor,
  roomId: RoomId
): DungeonFloor => ({
  ...floor,
  rooms: floor.rooms.map((room) =>
    room.id === roomId ? { ...room, cleared: true } : room
  ),
});

const relicChoices = (state: GameState): readonly RelicKind[] => {
  const rotation = ((state.floor.floor + state.currentRoomId) % 3) as 0 | 1 | 2;
  return Match.value(rotation).pipe(
    Match.when(0, () => ["ember-edge", "moss-guard", "echo-step"] as const),
    Match.when(1, () => ["ember-heart", "moss-bloom", "echo-lens"] as const),
    Match.when(2, () => ["ember-edge", "moss-bloom", "echo-lens"] as const),
    Match.exhaustive
  );
};

const spawnEnemies = (state: GameState, room: Room): readonly Enemy[] => {
  const count = Math.min(
    6,
    1 + Math.floor(state.floor.floor / 2) + (room.kind === "danger" ? 1 : 0)
  );
  return Array.from({ length: count }, (_, index) => ({
    hp: 1 + Math.floor(state.floor.floor / 3),
    id: `${state.floor.floor}-${room.id}-${index}`,
    kind: ENEMY_KINDS[index % ENEMY_KINDS.length] ?? "slime",
    position: {
      x: 6 + (index % 3) * 4,
      y: 3 + Math.floor(index / 3) * 5,
    },
  }));
};

const enterRoom = (
  state: GameState,
  roomId: RoomId,
  now: number
): Effect.Effect<GameState, InvalidTransitionError> => {
  if (state.phase._tag !== "Exploring") {
    return failTransition("EnterRoom", state.phase);
  }
  const currentRoom = findRoom(state, state.currentRoomId);
  const room = findRoom(state, roomId);
  if (!(currentRoom && room && currentRoom.exits.includes(roomId))) {
    return failTransition("EnterRoom", state.phase);
  }

  const enteredFrom = directionBetweenRooms(currentRoom, room);
  const entered = {
    ...state,
    currentRoomId: roomId,
    player: entryPosition(enteredFrom),
  };
  if (room.cleared) {
    return Effect.succeed({
      ...entered,
      phase: exploringPhase(roomId),
    });
  }

  return Match.value(room.kind).pipe(
    Match.when("start", () =>
      Effect.succeed({
        ...entered,
        floor: markRoomCleared(state.floor, roomId),
        phase: exploringPhase(roomId),
      })
    ),
    Match.when("combat", () =>
      Effect.succeed({
        ...entered,
        enemies: spawnEnemies(state, room),
        phase: fightingPhase(roomId, now),
      })
    ),
    Match.when("danger", () =>
      Effect.succeed({
        ...entered,
        enemies: spawnEnemies(state, room),
        phase: fightingPhase(roomId, now),
      })
    ),
    Match.when("reward", () =>
      Effect.succeed({
        ...entered,
        phase: rewardPhase(roomId, relicChoices(entered)),
      })
    ),
    Match.when("healing", () =>
      Effect.succeed({
        ...entered,
        floor: markRoomCleared(state.floor, roomId),
        hp: Math.min(state.maxHp, state.hp + 3),
        phase: exploringPhase(roomId),
      })
    ),
    Match.when("mystery", () =>
      Effect.succeed({
        ...entered,
        phase: rewardPhase(roomId, relicChoices(entered)),
      })
    ),
    Match.when("exit", () =>
      Effect.succeed({
        ...entered,
        floor: markRoomCleared(state.floor, roomId),
        phase: exploringPhase(roomId),
      })
    ),
    Match.exhaustive
  );
};

const isAlignedWithDoor = (position: Vector, direction: Direction): boolean =>
  Match.value(direction).pipe(
    Match.when("up", () => Math.abs(position.x - 10) <= 1.5),
    Match.when("down", () => Math.abs(position.x - 10) <= 1.5),
    Match.when("left", () => Math.abs(position.y - 6) <= 1.5),
    Match.when("right", () => Math.abs(position.y - 6) <= 1.5),
    Match.exhaustive
  );

const crossedRoomBoundary = (position: Vector, direction: Direction): boolean =>
  Match.value(direction).pipe(
    Match.when("up", () => position.y < ROOM_MIN_Y),
    Match.when("down", () => position.y > ROOM_MAX_Y),
    Match.when("left", () => position.x < ROOM_MIN_X),
    Match.when("right", () => position.x > ROOM_MAX_X),
    Match.exhaustive
  );

const movePlayer = (
  state: GameState,
  direction: Direction
): Effect.Effect<GameState, InvalidTransitionError> => {
  const nextPosition = moveVector(state.player, direction);
  if (
    state.phase._tag === "Exploring" &&
    crossedRoomBoundary(nextPosition, direction) &&
    isAlignedWithDoor(state.player, direction)
  ) {
    const currentRoom = findRoom(state, state.currentRoomId);
    const exit = currentRoom?.exits
      .map((exitId) => findRoom(state, exitId))
      .find(
        (candidate) =>
          currentRoom &&
          candidate &&
          directionBetweenRooms(currentRoom, candidate) === direction
      );
    if (exit) {
      return enterRoom(state, exit.id, state.elapsedMs);
    }
  }
  return Effect.succeed({
    ...state,
    facing: direction,
    player: clampToRoom(nextPosition),
  });
};

const clearCombatRoom = (state: GameState, clearBonus: number): GameState => {
  const room = findRoom(state, state.currentRoomId);
  const cleared = {
    ...state,
    enemies: [],
    floor: markRoomCleared(state.floor, state.currentRoomId),
    lastAttackMs: state.elapsedMs,
    score: state.score + clearBonus,
  };
  // Only danger rooms drop a relic after combat; normal fights just clear.
  if (room?.kind === "danger") {
    return {
      ...cleared,
      phase: rewardPhase(state.currentRoomId, relicChoices(state)),
    };
  }
  return {
    ...cleared,
    phase: exploringPhase(state.currentRoomId),
  };
};

const attack = (
  state: GameState
): Effect.Effect<GameState, InvalidTransitionError> => {
  if (state.phase._tag !== "Fighting") {
    return failTransition("Attack", state.phase);
  }
  if (state.enemies.length === 0) {
    return Effect.succeed(clearCombatRoom(state, 0));
  }
  const [target] = state.enemies
    .map((enemy, index) => ({
      distance:
        (enemy.position.x - state.player.x) ** 2 +
        (enemy.position.y - state.player.y) ** 2,
      enemy,
      index,
    }))
    .filter(({ distance }) => distance <= 9)
    .toSorted((left, right) => left.distance - right.distance);
  if (!target) {
    return Effect.succeed({ ...state, lastAttackMs: state.elapsedMs });
  }
  const defeated = target.enemy.hp - state.attack <= 0;
  const remaining = state.enemies.flatMap((enemy, index) => {
    if (index !== target.index) {
      return [enemy];
    }
    return defeated ? [] : [{ ...enemy, hp: enemy.hp - state.attack }];
  });
  const scoreGain = defeated ? 100 + state.dread * 15 + state.combo * 5 : 0;
  if (remaining.length === 0) {
    return Effect.succeed(
      clearCombatRoom(
        {
          ...state,
          combo: state.combo + 1,
          enemies: remaining,
          lastAttackMs: state.elapsedMs,
          score: state.score + scoreGain,
        },
        50
      )
    );
  }
  return Effect.succeed({
    ...state,
    combo: defeated ? state.combo + 1 : state.combo,
    enemies: remaining,
    lastAttackMs: state.elapsedMs,
    score: state.score + scoreGain,
  });
};

const dodge = (
  state: GameState
): Effect.Effect<GameState, InvalidTransitionError> => {
  if (state.phase._tag !== "Exploring" && state.phase._tag !== "Fighting") {
    return failTransition("Dodge", state.phase);
  }
  if (state.elapsedMs - state.lastDodgeMs < state.dashCooldownMs) {
    return Effect.succeed(state);
  }
  return Effect.succeed({
    ...state,
    lastDodgeMs: state.elapsedMs,
    player: clampToRoom(moveVector(state.player, state.facing, 2.5)),
  });
};

const applyRelic = (state: GameState, relic: RelicKind): GameState =>
  Match.value(relic).pipe(
    Match.when("ember-edge", () => ({ ...state, attack: state.attack + 1 })),
    Match.when("ember-heart", () => ({
      ...state,
      hp: state.hp + 2,
      maxHp: state.maxHp + 2,
    })),
    Match.when("moss-guard", () => ({
      ...state,
      hp: Math.min(state.maxHp + 1, state.hp + 1),
      maxHp: state.maxHp + 1,
    })),
    Match.when("moss-bloom", () => ({
      ...state,
      hp: Math.min(state.maxHp, state.hp + 3),
    })),
    Match.when("echo-step", () => ({
      ...state,
      dashCooldownMs: Math.max(250, state.dashCooldownMs - 100),
    })),
    Match.when("echo-lens", () => ({ ...state, score: state.score + 250 })),
    Match.exhaustive
  );

const chooseRelic = (
  state: GameState,
  relic: RelicKind
): Effect.Effect<GameState, InvalidTransitionError> => {
  if (
    state.phase._tag !== "ChoosingReward" ||
    !state.phase.choices.includes(relic)
  ) {
    return failTransition("ChooseRelic", state.phase);
  }
  const next = applyRelic(state, relic);
  return Effect.succeed({
    ...next,
    // Persist clearance so re-entering reward/mystery rooms cannot farm picks.
    floor: markRoomCleared(next.floor, state.currentRoomId),
    phase: exploringPhase(state.currentRoomId),
    relics: [...next.relics, relic],
  });
};

const pause = (
  state: GameState
): Effect.Effect<GameState, InvalidTransitionError> => {
  if (
    state.phase._tag === "Exploring" ||
    state.phase._tag === "Fighting" ||
    state.phase._tag === "ChoosingReward"
  ) {
    return Effect.succeed({
      ...state,
      phase: { _tag: "Paused", previous: state.phase },
    });
  }
  return failTransition("Pause", state.phase);
};

const endRun = (
  state: GameState,
  reason: "defeated" | "abandoned" | "invalid-run"
): GameState => ({
  ...state,
  enemies: [],
  phase: {
    _tag: "GameOver",
    finalFloor: state.floor.floor,
    finalScore: state.score,
    reason,
  },
});

export const applyCommand = (
  state: GameState,
  command: GameCommand
): Effect.Effect<GameState, InvalidTransitionError> =>
  Match.value(command).pipe(
    Match.when({ _tag: "Move" }, ({ direction }) => {
      if (state.phase._tag !== "Exploring" && state.phase._tag !== "Fighting") {
        return failTransition("Move", state.phase);
      }
      return movePlayer(state, direction);
    }),
    Match.when({ _tag: "EnterRoom" }, ({ now, roomId }) =>
      enterRoom(state, roomId, now)
    ),
    Match.when({ _tag: "Attack" }, () => attack(state)),
    Match.when({ _tag: "Dodge" }, () => dodge(state)),
    Match.when({ _tag: "TakeDamage" }, ({ amount }) => {
      if (state.phase._tag !== "Fighting") {
        return failTransition("TakeDamage", state.phase);
      }
      const hp = Math.max(0, state.hp - Math.max(0, amount));
      return Effect.succeed(
        hp === 0
          ? endRun({ ...state, hp }, "defeated")
          : { ...state, combo: 0, hp }
      );
    }),
    Match.when({ _tag: "ChooseRelic" }, ({ relic }) =>
      chooseRelic(state, relic)
    ),
    Match.when({ _tag: "Pause" }, () => pause(state)),
    Match.when({ _tag: "Resume" }, () => {
      if (state.phase._tag !== "Paused") {
        return failTransition("Resume", state.phase);
      }
      return Effect.succeed({ ...state, phase: state.phase.previous });
    }),
    Match.when({ _tag: "Tick" }, ({ deltaMs }) => {
      if (
        state.phase._tag === "Title" ||
        state.phase._tag === "Paused" ||
        state.phase._tag === "GameOver"
      ) {
        return Effect.succeed(state);
      }
      const nextElapsedMs =
        state.elapsedMs + Math.max(0, Math.min(100, deltaMs));
      if (state.phase._tag === "Fighting") {
        const enemyStep = 0.018 + state.dread * 0.002;
        const enemies = state.enemies.map((enemy) => {
          const deltaX = state.player.x - enemy.position.x;
          const deltaY = state.player.y - enemy.position.y;
          const length = Math.max(0.001, Math.hypot(deltaX, deltaY));
          return {
            ...enemy,
            position: clampToRoom({
              x: enemy.position.x + (deltaX / length) * enemyStep,
              y: enemy.position.y + (deltaY / length) * enemyStep,
            }),
          };
        });
        const touchingPlayer = enemies.some(
          (enemy) =>
            Math.hypot(
              enemy.position.x - state.player.x,
              enemy.position.y - state.player.y
            ) < 1.2
        );
        const damagePulse =
          Math.floor(state.elapsedMs / 1200) < Math.floor(nextElapsedMs / 1200);
        if (!(touchingPlayer && damagePulse)) {
          return Effect.succeed({
            ...state,
            elapsedMs: nextElapsedMs,
            enemies,
          });
        }
        const hp = Math.max(0, state.hp - 1);
        return Effect.succeed(
          hp === 0
            ? endRun(
                { ...state, elapsedMs: nextElapsedMs, enemies, hp },
                "defeated"
              )
            : {
                ...state,
                combo: 0,
                elapsedMs: nextElapsedMs,
                enemies,
                hp,
              }
        );
      }
      return Effect.succeed({
        ...state,
        elapsedMs: nextElapsedMs,
      });
    }),
    Match.when({ _tag: "EndRun" }, ({ reason }) =>
      Effect.succeed(endRun(state, reason))
    ),
    Match.exhaustive
  );

export const makeRunState = (
  floor: DungeonFloor,
  seed: Seed,
  now: number
): GameState => ({
  attack: 1,
  combo: 0,
  currentRoomId: floor.startRoomId,
  dashCooldownMs: 700,
  dread: 0,
  elapsedMs: 0,
  enemies: [],
  facing: "down",
  floor,
  hp: 8,
  lastAttackMs: -1000,
  lastDodgeMs: -1000,
  maxHp: 8,
  phase: exploringPhase(floor.startRoomId),
  player: PLAYER_START,
  relics: [],
  runId: makeRunId(seed, now),
  score: 0,
  startedAt: now,
});

interface GameSimulationShape {
  readonly changes: Stream.Stream<GameState>;
  readonly descend: (
    now: number
  ) => Effect.Effect<GameState, InvalidTransitionError>;
  readonly dispatch: (
    command: GameCommand
  ) => Effect.Effect<GameState, InvalidTransitionError>;
  readonly snapshot: Effect.Effect<GameState>;
  readonly start: (seed: Seed, now: number) => Effect.Effect<GameState>;
}

export class GameSimulation extends Context.Service<
  GameSimulation,
  GameSimulationShape
>()("depths/GameSimulation") {
  static readonly layer = Layer.effect(
    GameSimulation,
    Effect.gen(function* layer() {
      const generator = yield* DungeonGenerator;
      const initialSeed = SeedSchema.make(1);
      const initialFloor = yield* generator
        .generate(initialSeed, 1)
        .pipe(Effect.orDie);
      const initialState: GameState = {
        ...makeRunState(initialFloor, initialSeed, 0),
        phase: { _tag: "Title" } as const,
      };
      const stateRef = yield* SubscriptionRef.make(initialState);

      const start = Effect.fn("GameSimulation.start")(function* start(
        seed: Seed,
        now: number
      ) {
        const floor = yield* generator.generate(seed, 1).pipe(Effect.orDie);
        const state = makeRunState(floor, seed, now);
        yield* SubscriptionRef.set(stateRef, state);
        return state;
      });

      const dispatch = Effect.fn("GameSimulation.dispatch")(function* dispatch(
        command: GameCommand
      ) {
        return yield* SubscriptionRef.updateAndGetEffect(stateRef, (state) =>
          applyCommand(state, command)
        );
      });

      const descend = Effect.fn("GameSimulation.descend")(function* descend(
        now: number
      ) {
        const current = yield* SubscriptionRef.get(stateRef);
        if (
          current.phase._tag !== "Exploring" ||
          current.currentRoomId !== current.floor.exitRoomId
        ) {
          return yield* failTransition("Descend", current.phase);
        }
        const nextFloorNumber = current.floor.floor + 1;
        const nextFloor = yield* generator
          .generate(current.floor.seed, nextFloorNumber)
          .pipe(Effect.orDie);
        const next: GameState = {
          ...current,
          currentRoomId: nextFloor.startRoomId,
          dread: current.dread + 1,
          enemies: [],
          floor: nextFloor,
          phase: exploringPhase(nextFloor.startRoomId),
          player: PLAYER_START,
          score: current.score + current.floor.floor * 1000,
          startedAt: Math.min(current.startedAt, now),
        };
        yield* SubscriptionRef.set(stateRef, next);
        return next;
      });

      return {
        changes: SubscriptionRef.changes(stateRef),
        descend,
        dispatch,
        snapshot: SubscriptionRef.get(stateRef),
        start,
      };
    })
  ).pipe(Layer.provide(DungeonGenerator.layer));
}

export const isRunActive = (phase: GamePhase): boolean =>
  Match.value(phase).pipe(
    Match.when({ _tag: "Title" }, () => false),
    Match.when({ _tag: "Exploring" }, () => true),
    Match.when({ _tag: "Fighting" }, () => true),
    Match.when({ _tag: "ChoosingReward" }, () => true),
    Match.when(
      { _tag: "Paused" },
      ({ previous }) => activePhaseTag(previous).length > 0
    ),
    Match.when({ _tag: "GameOver" }, () => false),
    Match.exhaustive
  );

export const roomIdFromNumber = (value: number): RoomId =>
  RoomIdSchema.make(value);
