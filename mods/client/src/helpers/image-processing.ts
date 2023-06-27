import { assertTrue,assertNonNull } from "../../../common/asserts.ts";
import { SPRITE_SIZE } from "../../../core/vars.ts";
import { deferred } from "../../../deps.ts";

export function loadImage(
  { height, source, width }: {
    height: number;
    source: string;
    width: number;
  },
): Promise<HTMLImageElement> {
  const promise = deferred<HTMLImageElement>();
  const image = new Image();
  image.src = source;
  image.onload = () => {
    try {
      assertTrue(image.width === width, "unexpected-image-width", { source, imageWidth: image.width, width });
      assertTrue(image.height === height, "unexpected-image-height", { source, imageHeight: image.height, height });
    } catch (error: unknown) {
      promise.reject(error);
      return;
    }
    promise.resolve(image);
  };
  return promise;
}

export function createContext2D(
  width: number,
  height: number,
): CanvasRenderingContext2D {
  assertTrue(
    width % SPRITE_SIZE === 0,
    `canvas-width-must-be-multiples-of-${SPRITE_SIZE}`,
    { width },
  );
  assertTrue(
    height % SPRITE_SIZE === 0,
    `canvas-height-must-be-multiples-of-${SPRITE_SIZE}`,
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
  const tilesPerWidth = Math.floor(width / SPRITE_SIZE);
  const tilesPerHeight = Math.floor(height / SPRITE_SIZE);
  for (let y = 0; y < tilesPerHeight; y++) {
    for (let x = 0; x < tilesPerWidth; x++) {
      const tileImageData = context.getImageData(
        x * SPRITE_SIZE,
        y * SPRITE_SIZE,
        SPRITE_SIZE,
        SPRITE_SIZE,
      );
      yield tileImageData;
    }
  }
}
