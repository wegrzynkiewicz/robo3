import { DimensionalRectangle } from "../../math/DimensionalRectangle.ts";
import { SpriteAtlasSource } from "./atlas.ts";

export interface AtlasSpriteOrigin {
  atlas: SpriteAtlasSource;
  type: 'atlas';
}

export type SpriteOrigin = AtlasSpriteOrigin;

export interface SpriteSource {
  origin: SpriteOrigin;
  spriteId: string;
  sourceRect: DimensionalRectangle;
}

export interface SpriteImageData {
  image: ImageData;
  source: SpriteSource;
}
