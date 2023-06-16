import { assertNonNull, assertTrue } from "../../../common/asserts.ts";
import { TILE_SIZE } from "../../../core/vars.ts";

export function createContext2D(
  width: number,
  height: number,
): CanvasRenderingContext2D {
  assertTrue(
    width % TILE_SIZE === 0,
    `canvas-width-must-be-multiples-of-${TILE_SIZE}`,
    { width },
  );
  assertTrue(
    height % TILE_SIZE === 0,
    `canvas-height-must-be-multiples-of-${TILE_SIZE}`,
    { height },
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
    alpha: true,
  });
  assertNonNull(context, "cannot-create-context-from-canvas");
  return context;
}

export function* getTilesFromCanvasContext(
  context: CanvasRenderingContext2D,
): Generator<ImageData, void, unknown> {
  const { canvas } = context;
  const { height, width } = canvas;
  const tilesPerWidth = Math.floor(width / TILE_SIZE);
  const tilesPerHeight = Math.floor(height / TILE_SIZE);
  for (let y = 0; y < tilesPerHeight; y++) {
    for (let x = 0; x < tilesPerWidth; x++) {
      const tileImageData = context.getImageData(
        x * TILE_SIZE,
        y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
      );
      yield tileImageData;
    }
  }
}
