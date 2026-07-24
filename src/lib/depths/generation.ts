/* eslint-disable no-bitwise, unicorn/prefer-math-trunc */

import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { GenerationError, RoomIdSchema, SeedSchema } from "@/lib/depths/schema";
import type {
  DungeonFloor,
  Room,
  RoomId,
  RoomKind,
  Seed,
} from "@/lib/depths/schema";

interface RandomSource {
  readonly nextInt: (maximum: number) => number;
}

const makeRandomSource = (seed: number): RandomSource => {
  let state = (Math.trunc(seed) || 1) >>> 0;
  const nextFloat = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4_294_967_296;
  };
  return {
    nextInt: (maximum) => Math.floor(nextFloat() * maximum),
  };
};

const roomId = (value: number): RoomId => RoomIdSchema.make(value);

const pickKind = (
  random: RandomSource,
  values: readonly [RoomKind, ...RoomKind[]]
): RoomKind => values[random.nextInt(values.length)] ?? values[0];

const connect = (rooms: Room[], leftId: RoomId, rightId: RoomId) => {
  const leftIndex = rooms.findIndex((room) => room.id === leftId);
  const rightIndex = rooms.findIndex((room) => room.id === rightId);
  const left = rooms[leftIndex];
  const right = rooms[rightIndex];
  if (!(left && right)) {
    return false;
  }
  rooms[leftIndex] = { ...left, exits: [...left.exits, rightId] };
  rooms[rightIndex] = { ...right, exits: [...right.exits, leftId] };
  return true;
};

const makeMainRoom = (
  id: number,
  floor: number,
  random: RandomSource
): Room => {
  let kind: RoomKind;
  if (id === 0) {
    kind = "start";
  } else if (id === 4) {
    kind = "exit";
  } else if (id === 2) {
    kind = pickKind(random, ["reward", "mystery"]);
  } else {
    kind = pickKind(
      random,
      floor >= 4 ? ["combat", "danger", "danger"] : ["combat", "danger"]
    );
  }
  return {
    cleared: kind === "start",
    depth: id,
    exits: [],
    id: roomId(id),
    kind,
    position: { x: id * 12, y: 12 },
  };
};

const generateFloorUnsafe = (seedInput: Seed, floor: number): DungeonFloor => {
  const normalizedFloor = Math.max(1, Math.trunc(floor));
  const floorSeed = SeedSchema.make(
    Math.abs((seedInput * 31 + normalizedFloor * 7919) | 0)
  );
  const random = makeRandomSource(floorSeed);
  const rooms = Array.from({ length: 5 }, (_, index) =>
    makeMainRoom(index, normalizedFloor, random)
  );

  for (let branch = 0; branch < 3; branch += 1) {
    const parentId = roomId(1 + branch);
    const id = roomId(5 + branch);
    const branchKind = pickKind(random, [
      "healing",
      "mystery",
      "reward",
      "danger",
    ]);
    rooms.push({
      cleared: false,
      depth: branch + 2,
      exits: [],
      id,
      kind: branchKind,
      position: {
        x: (branch + 1) * 12,
        y: branch % 2 === 0 ? 2 : 22,
      },
    });
    if (!connect(rooms, parentId, id)) {
      throw new Error("Could not connect generated branch");
    }
  }

  for (let index = 0; index < 4; index += 1) {
    if (!connect(rooms, roomId(index), roomId(index + 1))) {
      throw new Error("Could not connect generated main path");
    }
  }

  return {
    exitRoomId: roomId(4),
    floor: normalizedFloor,
    rooms,
    seed: floorSeed,
    startRoomId: roomId(0),
  };
};

export const generateFloor = (
  seed: Seed,
  floor: number
): Effect.Effect<DungeonFloor, GenerationError> =>
  Effect.try({
    catch: (error) =>
      new GenerationError({
        message: error instanceof Error ? error.message : "Generation failed",
        seed,
      }),
    try: () => generateFloorUnsafe(seed, floor),
  });

interface DungeonGeneratorShape {
  readonly generate: (
    seed: Seed,
    floor: number
  ) => Effect.Effect<DungeonFloor, GenerationError>;
}

export class DungeonGenerator extends Context.Service<
  DungeonGenerator,
  DungeonGeneratorShape
>()("depths/DungeonGenerator") {
  static readonly layer = Layer.succeed(DungeonGenerator, {
    generate: generateFloor,
  });
}
