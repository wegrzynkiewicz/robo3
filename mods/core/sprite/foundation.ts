import { Rectangle } from "../numbers.ts";
import { SpriteDefinition } from "./defining.ts";

export interface Sprite {
  atlas: SpriteAtlas;
  definition: SpriteDefinition;
  spriteKey: string;
  sourceRect: Rectangle;
}

export interface SpriteAtlas {
  image: {
    height: number;
    source: string;
    width: number;
  };
  spriteAtlasKey: string;
}
