import { createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import type { ImageData } from "https://deno.land/x/canvas@v1.4.1/mod.ts";

const canvas = createCanvas(64, 64);
const context = canvas.getContext("2d");

const SPRITE_SIZE = 32;

export function createTextureTileHelper(r: number, g: number, b: number): ImageData {
  //   const tile = new ImageData(SPRITE_SIZE, SPRITE_SIZE);
  const tile = context.createImageData(SPRITE_SIZE, SPRITE_SIZE);
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

const helper = createTextureTileHelper(255, 0, 0);
context.putImageData(helper, 20, 20);

await Deno.writeFile("image.png", canvas.toBuffer());
