import { DimensionalRectangle } from "../../math/DimensionalRectangle.ts";
import { SpriteDefinition } from "./defining.ts";

export interface Sprite {
  atlas: SpriteAtlas;
  definition: SpriteDefinition;
  spriteKey: string;
  sourceRect: DimensionalRectangle;
}

export interface SpriteAtlas {
  image: {
    height: number;
    source: string;
    width: number;
  };
  spriteAtlasKey: string;
}
