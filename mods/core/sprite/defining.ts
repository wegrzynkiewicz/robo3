import { Registry } from "../../common/registry.ts";

export interface SpriteDefinition {
  height?: number;
  predefinedSpriteIndex?: number;
  spriteAtlasKey: string;
  spriteKey: string;
  width?: number;
  x: number;
  y: number;
}

export const spriteRegistry = new Registry<SpriteDefinition>((e) => e.spriteKey);
export const defineSprite = spriteRegistry.register.bind(spriteRegistry);

export interface SpriteAtlasDefinition {
  image: {
    width: number;
    height: number;
    source: string;
  };
  spriteAtlasKey: string;
}

export const spriteAtlasRegistry = new Registry<SpriteAtlasDefinition>((e) => e.spriteAtlasKey);
export const defineSpriteAtlas = spriteAtlasRegistry.register.bind(spriteAtlasRegistry);
