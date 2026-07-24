/* eslint-disable max-classes-per-file */

import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Match from "effect/Match";
import * as Queue from "effect/Queue";

import {
  createDepthsSpriteAtlas,
  SPRITE_SIZE,
} from "@/components/depths/depths-sprites";
import type { DepthsSpriteAtlas } from "@/components/depths/depths-sprites";
import { RenderingError, SeedSchema } from "@/lib/depths/schema";
import type {
  Direction,
  GameCommand,
  GameState,
  RelicKind,
  RoomKind,
  Seed,
} from "@/lib/depths/schema";
import { directionBetweenRooms, GameSimulation } from "@/lib/depths/simulation";

const INTERNAL_WIDTH = 320;
const INTERNAL_HEIGHT = 180;
const ROOM_ORIGIN_X = 40;
const ROOM_ORIGIN_Y = 30;
const ROOM_TILES_HIGH = 12;
const ROOM_TILES_WIDE = 20;
const TILE_SIZE = 12;

const roomColor = (kind: RoomKind): string =>
  Match.value(kind).pipe(
    Match.when("start", () => "#3d7655"),
    Match.when("combat", () => "#7b3b45"),
    Match.when("danger", () => "#a64b38"),
    Match.when("reward", () => "#a87936"),
    Match.when("healing", () => "#397769"),
    Match.when("mystery", () => "#644f8e"),
    Match.when("exit", () => "#3f7195"),
    Match.exhaustive
  );

const tileToCanvasX = (value: number) =>
  Math.round(ROOM_ORIGIN_X + value * TILE_SIZE);
const tileToCanvasY = (value: number) =>
  Math.round(ROOM_ORIGIN_Y + value * TILE_SIZE);

const drawPixelText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) => {
  context.fillStyle = "#e9e0c8";
  context.font = "8px monospace";
  context.textBaseline = "top";
  context.fillText(text, x, y);
};

const roomObjective = (state: GameState): string =>
  Match.value(state.phase).pipe(
    Match.when({ _tag: "Title" }, () => "PRESS START"),
    Match.when({ _tag: "Exploring" }, () =>
      state.currentRoomId === state.floor.exitRoomId
        ? "THE STAIRWAY IS OPEN"
        : "WALK THROUGH A COLORED DOOR"
    ),
    Match.when(
      { _tag: "Fighting" },
      () =>
        `DEFEAT ${state.enemies.length} ${state.enemies.length === 1 ? "ENEMY" : "ENEMIES"}`
    ),
    Match.when({ _tag: "ChoosingReward" }, () => "CHOOSE A RELIC"),
    Match.when({ _tag: "Paused" }, () => "PAUSED"),
    Match.when({ _tag: "GameOver" }, () => "RUN ENDED"),
    Match.exhaustive
  );

const drawRoomFeature = (context: CanvasRenderingContext2D, kind: RoomKind) =>
  Match.value(kind).pipe(
    Match.when("start", () => {
      context.fillStyle = "#2f5f50";
      context.fillRect(tileToCanvasX(8), tileToCanvasY(4), 48, 36);
      context.fillStyle = "#4d9270";
      context.fillRect(tileToCanvasX(9), tileToCanvasY(5), 24, 12);
    }),
    Match.when("combat", () => {
      context.fillStyle = "#6d343e";
      context.fillRect(tileToCanvasX(9), tileToCanvasY(4), 24, 24);
      context.fillStyle = "#b95b4d";
      context.fillRect(tileToCanvasX(9) + 5, tileToCanvasY(4) + 5, 14, 14);
    }),
    Match.when("danger", () => {
      context.fillStyle = "#9c4b39";
      for (const [x, y] of [
        [4, 3],
        [15, 3],
        [4, 8],
        [15, 8],
      ]) {
        context.fillRect(tileToCanvasX(x), tileToCanvasY(y), 8, 8);
      }
    }),
    Match.when("reward", () => {
      context.fillStyle = "#5d3f28";
      context.fillRect(tileToCanvasX(9), tileToCanvasY(5), 24, 18);
      context.fillStyle = "#e3ad45";
      context.fillRect(tileToCanvasX(9) + 3, tileToCanvasY(5) + 3, 18, 4);
    }),
    Match.when("healing", () => {
      context.fillStyle = "#24595a";
      context.fillRect(tileToCanvasX(7), tileToCanvasY(4), 72, 36);
      context.fillStyle = "#4ba9a0";
      context.fillRect(tileToCanvasX(8), tileToCanvasY(5), 48, 12);
    }),
    Match.when("mystery", () => {
      context.fillStyle = "#503e78";
      context.fillRect(tileToCanvasX(9), tileToCanvasY(4), 24, 36);
      context.fillStyle = "#a987d3";
      context.fillRect(tileToCanvasX(9) + 9, tileToCanvasY(4) + 6, 6, 20);
    }),
    Match.when("exit", () => {
      context.fillStyle = "#293c56";
      for (let step = 0; step < 5; step += 1) {
        context.fillRect(
          tileToCanvasX(7 + step),
          tileToCanvasY(3 + step),
          72 - step * 12,
          8
        );
      }
    }),
    Match.exhaustive
  );

const roomTileColor = (isWall: boolean, alternate: boolean): string => {
  if (isWall) {
    return alternate ? "#332d47" : "#29253a";
  }
  return alternate ? "#1c1a2b" : "#211e31";
};

// The renderer intentionally owns the complete pixel-room composition.
// eslint-disable-next-line complexity
const drawState = (
  context: CanvasRenderingContext2D,
  state: GameState,
  atlas: DepthsSpriteAtlas
) => {
  context.imageSmoothingEnabled = false;
  context.fillStyle = "#100f1c";
  context.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

  const room =
    state.floor.rooms.find(
      (candidate) => candidate.id === state.currentRoomId
    ) ?? state.floor.rooms[0];
  if (!room) {
    return;
  }
  const doors = room.exits.flatMap((exitId) => {
    const exit = state.floor.rooms.find((candidate) => candidate.id === exitId);
    return exit
      ? [{ direction: directionBetweenRooms(room, exit), room: exit }]
      : [];
  });
  const doorDirections = new Set(doors.map(({ direction }) => direction));
  const roomLocked = state.phase._tag === "Fighting";

  for (let y = 0; y < ROOM_TILES_HIGH; y += 1) {
    for (let x = 0; x < ROOM_TILES_WIDE; x += 1) {
      const isWall =
        x === 0 ||
        x === ROOM_TILES_WIDE - 1 ||
        y === 0 ||
        y === ROOM_TILES_HIGH - 1;
      const inHorizontalDoor = x >= 9 && x <= 11;
      const inVerticalDoor = y >= 5 && y <= 7;
      const isDoorOpening =
        (y === 0 && inHorizontalDoor && doorDirections.has("up")) ||
        (y === ROOM_TILES_HIGH - 1 &&
          inHorizontalDoor &&
          doorDirections.has("down")) ||
        (x === 0 && inVerticalDoor && doorDirections.has("left")) ||
        (x === ROOM_TILES_WIDE - 1 &&
          inVerticalDoor &&
          doorDirections.has("right"));
      const drawWall = isWall && (!isDoorOpening || roomLocked);
      context.fillStyle = roomTileColor(drawWall, (x + y) % 2 === 0);
      context.fillRect(
        tileToCanvasX(x),
        tileToCanvasY(y),
        TILE_SIZE,
        TILE_SIZE
      );
      if (drawWall && y < ROOM_TILES_HIGH - 1) {
        context.fillStyle = "#433a58";
        context.fillRect(tileToCanvasX(x), tileToCanvasY(y), TILE_SIZE, 2);
      }
    }
  }

  drawRoomFeature(context, room.kind);

  for (const door of doors) {
    context.fillStyle = roomLocked ? "#6a3038" : roomColor(door.room.kind);
    Match.value(door.direction).pipe(
      Match.when("up", () =>
        context.fillRect(tileToCanvasX(9), tileToCanvasY(0), 36, 4)
      ),
      Match.when("down", () =>
        context.fillRect(tileToCanvasX(9), tileToCanvasY(11) + 8, 36, 4)
      ),
      Match.when("left", () =>
        context.fillRect(tileToCanvasX(0), tileToCanvasY(5), 4, 36)
      ),
      Match.when("right", () =>
        context.fillRect(tileToCanvasX(19) + 8, tileToCanvasY(5), 4, 36)
      ),
      Match.exhaustive
    );
  }

  const playerX = tileToCanvasX(state.player.x) - 2;
  const playerY = tileToCanvasY(state.player.y) - 4;
  context.drawImage(
    atlas.canvas,
    atlas.player * SPRITE_SIZE,
    0,
    SPRITE_SIZE,
    SPRITE_SIZE,
    playerX,
    playerY,
    SPRITE_SIZE,
    SPRITE_SIZE
  );

  for (const enemy of state.enemies) {
    context.drawImage(
      atlas.canvas,
      atlas.enemy[enemy.kind] * SPRITE_SIZE,
      0,
      SPRITE_SIZE,
      SPRITE_SIZE,
      tileToCanvasX(enemy.position.x) - 2,
      tileToCanvasY(enemy.position.y) - 4,
      SPRITE_SIZE,
      SPRITE_SIZE
    );
  }

  if (state.elapsedMs - state.lastAttackMs < 160) {
    const slash = Match.value(state.facing).pipe(
      Match.when("up", () => ({ height: 8, width: 16, x: 0, y: -10 })),
      Match.when("down", () => ({ height: 8, width: 16, x: 0, y: 18 })),
      Match.when("left", () => ({ height: 16, width: 8, x: -10, y: 0 })),
      Match.when("right", () => ({ height: 16, width: 8, x: 18, y: 0 })),
      Match.exhaustive
    );
    context.fillStyle = "#f3d783";
    context.fillRect(
      playerX + slash.x,
      playerY + slash.y,
      slash.width,
      slash.height
    );
  }

  context.fillStyle = "#151221";
  context.fillRect(0, 0, INTERNAL_WIDTH, 27);
  drawPixelText(context, `DEPTH ${state.floor.floor}`, 7, 6);
  drawPixelText(context, `HP ${state.hp}/${state.maxHp}`, 76, 6);
  drawPixelText(context, roomObjective(state), 137, 6);
  drawPixelText(context, state.score.toString().padStart(6, "0"), 270, 6);
  context.fillStyle = roomColor(room.kind);
  context.fillRect(7, 18, 6, 3);
  drawPixelText(context, room.kind.toUpperCase(), 17, 16);
};

interface RendererShape {
  readonly render: (state: GameState) => Effect.Effect<void, RenderingError>;
}

class Renderer extends Context.Service<Renderer, RendererShape>()(
  "depths/Renderer"
) {
  static layer(canvas: HTMLCanvasElement) {
    const atlas = createDepthsSpriteAtlas(canvas.ownerDocument);
    return Layer.succeed(Renderer, {
      render: (state) =>
        Effect.try({
          catch: (error) =>
            new RenderingError({
              message:
                error instanceof Error ? error.message : "Canvas render failed",
            }),
          try: () => {
            canvas.height = INTERNAL_HEIGHT;
            canvas.width = INTERNAL_WIDTH;
            const context = canvas.getContext("2d");
            if (!context) {
              throw new Error("Canvas 2D is unavailable");
            }
            drawState(context, state, atlas);
          },
        }),
    });
  }
}

interface GameClockShape {
  readonly nextFrame: Effect.Effect<number>;
}

class GameClock extends Context.Service<GameClock, GameClockShape>()(
  "depths/GameClock"
) {
  static readonly browserLayer = Layer.succeed(GameClock, {
    nextFrame: Effect.callback<number>((resume) => {
      const frame = window.requestAnimationFrame((timestamp) => {
        resume(Effect.succeed(timestamp));
      });
      return Effect.sync(() => window.cancelAnimationFrame(frame));
    }),
  });
}

const commandFromKey = (event: KeyboardEvent): GameCommand | undefined => {
  const direction = Match.value(event.key).pipe(
    Match.when("ArrowUp", () => "up" as const),
    Match.when("w", () => "up" as const),
    Match.when("W", () => "up" as const),
    Match.when("ArrowDown", () => "down" as const),
    Match.when("s", () => "down" as const),
    Match.when("S", () => "down" as const),
    Match.when("ArrowLeft", () => "left" as const),
    Match.when("a", () => "left" as const),
    Match.when("A", () => "left" as const),
    Match.when("ArrowRight", () => "right" as const),
    Match.when("d", () => "right" as const),
    Match.when("D", () => "right" as const),
    Match.orElse((): undefined => undefined)
  );
  if (direction) {
    return { _tag: "Move", direction };
  }
  if (event.code === "Space" || event.key === "Enter") {
    return { _tag: "Attack" };
  }
  if (event.key === "Shift") {
    return { _tag: "Dodge" };
  }
  return undefined;
};

const installInput = (queue: Queue.Queue<GameCommand>) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const listener = (event: KeyboardEvent) => {
        const command = commandFromKey(event);
        if (!command) {
          return;
        }
        event.preventDefault();
        Queue.offerUnsafe(queue, command);
      };
      window.addEventListener("keydown", listener);
      return listener;
    }),
    (listener) =>
      Effect.sync(() => {
        window.removeEventListener("keydown", listener);
      })
  );

const runLoop = (
  onState: (state: GameState) => void,
  onError: (message: string) => void
) =>
  Effect.scoped(
    Effect.gen(function* runDepthsLoop() {
      const simulation = yield* GameSimulation;
      const renderer = yield* Renderer;
      const clock = yield* GameClock;
      const commands = yield* Queue.unbounded<GameCommand>();
      yield* installInput(commands);

      yield* Effect.forkScoped(
        Effect.forever(
          Queue.take(commands).pipe(
            Effect.flatMap(simulation.dispatch),
            Effect.tap((state) => Effect.sync(() => onState(state))),
            Effect.catchTag("InvalidTransitionError", () => Effect.void)
          )
        )
      );

      let previous = yield* clock.nextFrame;
      while (true) {
        const timestamp = yield* clock.nextFrame;
        const deltaMs = Math.min(100, Math.max(0, timestamp - previous));
        previous = timestamp;
        const state = yield* simulation
          .dispatch({ _tag: "Tick", deltaMs })
          .pipe(
            Effect.catchTag("InvalidTransitionError", () => simulation.snapshot)
          );
        yield* renderer
          .render(state)
          .pipe(
            Effect.catchTag("RenderingError", (error) =>
              Effect.sync(() => onError(error.message))
            )
          );
        yield* Effect.sync(() => onState(state));
      }
    })
  );

export interface DepthsSession {
  readonly attack: () => void;
  readonly chooseRelic: (relic: RelicKind) => void;
  readonly descend: () => void;
  readonly dispose: () => void;
  readonly dodge: () => void;
  readonly end: () => void;
  readonly move: (direction: Direction) => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly start: (seed?: number) => void;
}

export const createDepthsSession = (
  canvas: HTMLCanvasElement,
  onState: (state: GameState) => void,
  onError: (message: string) => void
): DepthsSession => {
  const layer = Layer.mergeAll(
    GameSimulation.layer,
    Renderer.layer(canvas),
    GameClock.browserLayer
  );
  const runtime = ManagedRuntime.make(layer);
  const interruptLoop = runtime.runCallback(runLoop(onState, onError), {
    onExit: (exit) => {
      Exit.match(exit, {
        onFailure: (cause) => {
          if (!Cause.hasInterruptsOnly(cause)) {
            onError(Cause.pretty(cause));
          }
        },
        onSuccess: () => null,
      });
    },
  });

  const run = <E>(effect: Effect.Effect<GameState, E, GameSimulation>) => {
    runtime.runCallback(effect, {
      onExit: (exit) => {
        Exit.match(exit, {
          onFailure: (cause) => onError(Cause.pretty(cause)),
          onSuccess: onState,
        });
      },
    });
  };

  const dispatch = (command: GameCommand) =>
    run(
      Effect.gen(function* dispatchCommand() {
        const simulation = yield* GameSimulation;
        return yield* simulation.dispatch(command);
      })
    );

  return {
    attack: () => dispatch({ _tag: "Attack" }),
    chooseRelic: (relic) => dispatch({ _tag: "ChooseRelic", relic }),
    descend: () =>
      run(
        Effect.gen(function* descendFloor() {
          const simulation = yield* GameSimulation;
          return yield* simulation.descend(Date.now());
        })
      ),
    dispose: () => {
      interruptLoop();
      Effect.runFork(runtime.disposeEffect);
    },
    dodge: () => dispatch({ _tag: "Dodge" }),
    end: () => dispatch({ _tag: "EndRun", reason: "abandoned" }),
    move: (direction) => dispatch({ _tag: "Move", direction }),
    pause: () => dispatch({ _tag: "Pause" }),
    resume: () => dispatch({ _tag: "Resume" }),
    start: (seed = Date.now()) => {
      const parsedSeed: Seed = SeedSchema.make(
        Math.abs(Math.trunc(seed)) % 2_147_483_647
      );
      run(
        Effect.gen(function* startRun() {
          const simulation = yield* GameSimulation;
          return yield* simulation.start(parsedSeed, Date.now());
        })
      );
    },
  };
};
