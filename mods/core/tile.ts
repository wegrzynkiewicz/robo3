import { generateHighContrastColor } from "../client/src/graphic/color.ts";
import { assertNonNull, assertTrue } from "../utils/asserts.ts";
import { coords2ImageRect, index2coords } from "./numbers.ts";
import { SPRITE_SIZE, SPRITES_TEXTURE_SIZE } from "./vars.ts";

export interface Tile {
  tileId: string;
  spriteIndex: string;
}

export function createContext2D(width: number, height: number): CanvasRenderingContext2D {
  assertTrue(width % SPRITE_SIZE === 0, `canvas-width-must-be-multiples-of-${SPRITE_SIZE}`, { width });
  assertTrue(height % SPRITE_SIZE === 0, `canvas-height-must-be-multiples-of-${SPRITE_SIZE}`, { height });
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

export function createTextureTileHelper(r: number, g: number, b: number): ImageData {
  const tile = new ImageData(SPRITE_SIZE, SPRITE_SIZE);
  const buffer = tile.data;
  let pixelIndex = 0;
  for (let y = 0; y < SPRITE_SIZE; y++) {
    for (let x = 0; x < SPRITE_SIZE; x++) {
      const paint = x % 2 === 1 || y % 2 === 0;
      buffer[pixelIndex + 0] = paint ? r : 0xFF;
      buffer[pixelIndex + 1] = paint ? g : 0x00;
      buffer[pixelIndex + 2] = paint ? b : 0xFF;
      buffer[pixelIndex + 3] = 0xFF;
      pixelIndex += 4;
    }
  }
  return tile;
}

export function createFocusTileHelper(): ImageData {
  const tile = new ImageData(SPRITE_SIZE, SPRITE_SIZE);
  const buffer = tile.data;
  let pixelIndex = 0;
  for (let y = 0; y < SPRITE_SIZE; y++) {
    for (let x = 0; x < SPRITE_SIZE; x++) {
      const paint = x % (SPRITE_SIZE - 1) === 0 || y % (SPRITE_SIZE - 1) === 0;
      buffer[pixelIndex + 0] = 0x00;
      buffer[pixelIndex + 1] = 0x00;
      buffer[pixelIndex + 2] = 0x00;
      buffer[pixelIndex + 3] = paint ? 0x22 : 0x00;
      pixelIndex += 4;
    }
  }
  return tile;
}

export function* getTilesFromCanvasContext(context: CanvasRenderingContext2D): Generator<ImageData, void, unknown> {
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

export interface TileTexture {
  spriteIndex: number;
}

export class TilesTextureAllocator {
  public readonly contexts: CanvasRenderingContext2D[] = [];
  private spriteIndex = 0;
  private currentZ = -1;
  private currentTargetContext!: CanvasRenderingContext2D;

  public insert(image: ImageData): TileTexture {
    let [x, y, z] = index2coords(this.spriteIndex);
    if (z !== this.currentZ) {
      this.currentZ = z;
      this.currentTargetContext = createContext2D(SPRITES_TEXTURE_SIZE, SPRITES_TEXTURE_SIZE);
      this.contexts.push(this.currentTargetContext);
      this.spriteIndex++;
      [x, y] = index2coords(this.spriteIndex);
    }
    const [s, t] = coords2ImageRect(x, y);
    this.currentTargetContext!.putImageData(image, s, t);
    const tileTexture = {
      spriteIndex: this.spriteIndex,
    };
    this.spriteIndex++;
    return tileTexture;
  }

  public paintHelperTiles(): void {
    const countOfContexts = this.contexts.length;
    const [s, t] = coords2ImageRect(0, 0);
    for (let z = 0; z < countOfContexts; z++) {
      const context = this.contexts[z];
      const [r, g, b] = generateHighContrastColor(z, countOfContexts);
      const helperTile = createTextureTileHelper(r, g, b);
      context.putImageData(helperTile, s, t);
      const focus = createFocusTileHelper();
      context.putImageData(focus, s, t);
    }
  }
}

export class TileManager {
}
