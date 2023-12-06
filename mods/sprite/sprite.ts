import { DimensionalRectangle } from "../common/math/DimensionalRectangle.ts";
import { SpriteAtlasSource } from "../sprite-atlas/atlas.ts";

export interface StaticSpriteAllocation {
  type: "static";
}

export type SpriteAllocation = StaticSpriteAllocation;

export interface AtlasSpriteOrigin {
  atlas: SpriteAtlasSource;
  type: "atlas";
}

export type SpriteOrigin = AtlasSpriteOrigin;

export interface SpriteSource {
  origin: SpriteOrigin;
  allocation: SpriteAllocation;
  spriteId: string;
  sourceRect: DimensionalRectangle;
}

export interface SpriteImage {
  image: ImageData;
  source: SpriteSource;
}
