export const SPRITE_SIZE = 16;

export interface DepthsSpriteAtlas {
  readonly canvas: HTMLCanvasElement;
  readonly enemy: {
    readonly sentinel: number;
    readonly slime: number;
    readonly wisp: number;
  };
  readonly player: number;
}

const drawPlayer = (context: CanvasRenderingContext2D, offset: number) => {
  context.fillStyle = "#f4d58d";
  context.fillRect(offset + 5, 2, 6, 4);
  context.fillStyle = "#2a1f2d";
  context.fillRect(offset + 4, 1, 8, 2);
  context.fillRect(offset + 4, 6, 8, 2);
  context.fillStyle = "#e8613c";
  context.fillRect(offset + 3, 8, 10, 5);
  context.fillStyle = "#6a3e73";
  context.fillRect(offset + 4, 13, 3, 3);
  context.fillRect(offset + 9, 13, 3, 3);
  context.fillStyle = "#1b1423";
  context.fillRect(offset + 6, 4, 1, 1);
  context.fillRect(offset + 9, 4, 1, 1);
};

const drawSlime = (context: CanvasRenderingContext2D, offset: number) => {
  context.fillStyle = "#19352f";
  context.fillRect(offset + 3, 8, 10, 6);
  context.fillRect(offset + 5, 5, 6, 3);
  context.fillStyle = "#59b86c";
  context.fillRect(offset + 4, 7, 8, 6);
  context.fillRect(offset + 6, 4, 4, 3);
  context.fillStyle = "#f4d58d";
  context.fillRect(offset + 6, 8, 1, 2);
  context.fillRect(offset + 9, 8, 1, 2);
};

const drawWisp = (context: CanvasRenderingContext2D, offset: number) => {
  context.fillStyle = "#333060";
  context.fillRect(offset + 5, 4, 6, 8);
  context.fillRect(offset + 7, 12, 2, 3);
  context.fillStyle = "#68b8d7";
  context.fillRect(offset + 6, 3, 4, 8);
  context.fillStyle = "#d6f1f5";
  context.fillRect(offset + 7, 5, 2, 3);
};

const drawSentinel = (context: CanvasRenderingContext2D, offset: number) => {
  context.fillStyle = "#2a1f2d";
  context.fillRect(offset + 3, 3, 10, 11);
  context.fillStyle = "#9a6b52";
  context.fillRect(offset + 4, 4, 8, 9);
  context.fillStyle = "#e9a23b";
  context.fillRect(offset + 5, 7, 6, 2);
  context.fillStyle = "#271728";
  context.fillRect(offset + 6, 7, 1, 2);
  context.fillRect(offset + 9, 7, 1, 2);
};

export const createDepthsSpriteAtlas = (
  ownerDocument: Document
): DepthsSpriteAtlas => {
  const canvas = ownerDocument.createElement("canvas");
  canvas.height = SPRITE_SIZE;
  canvas.width = SPRITE_SIZE * 4;
  const context = canvas.getContext("2d");
  if (!context) {
    return {
      canvas,
      enemy: { sentinel: 3, slime: 1, wisp: 2 },
      player: 0,
    };
  }
  context.imageSmoothingEnabled = false;
  drawPlayer(context, 0);
  drawSlime(context, SPRITE_SIZE);
  drawWisp(context, SPRITE_SIZE * 2);
  drawSentinel(context, SPRITE_SIZE * 3);
  return {
    canvas,
    enemy: { sentinel: 3, slime: 1, wisp: 2 },
    player: 0,
  };
};
