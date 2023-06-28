import { throws } from "../../common/asserts.ts";
import { Registry } from "../../common/registry.ts";
import { Rectangle } from "../numbers.ts";
import { SPRITE_SIZE } from "../vars.ts";

export interface SpriteDefinition {
  predefinedSpriteIndex?: number;
  sourceRect: Partial<Rectangle>;
  spriteAtlasKey: string;
  spriteKey: string;
}

export const spriteRegistry = new Registry<SpriteDefinition>((e) => e.spriteKey);
export const defineSprite = spriteRegistry.register.bind(spriteRegistry);

export interface SpriteAtlasDefinition {
  image: {
    height: number;
    source: string;
    width: number;
  };
  spriteAtlasKey: string;
}

export const spriteAtlasRegistry = new Registry<SpriteAtlasDefinition>((e) => e.spriteAtlasKey);
export const defineSpriteAtlas = spriteAtlasRegistry.register.bind(spriteAtlasRegistry);

export function defineSpritesFromAtlas(
  { spriteAtlasKey }: {
    spriteAtlasKey: string;
  }
) {
  const atlas = spriteAtlasRegistry.entities.get(spriteAtlasKey);
  if (atlas === undefined) {
    throws("error", { spriteAtlasKey });
  }
  const { height, width } = atlas.image;
  const rows = Math.floor(width / SPRITE_SIZE);
  const cols = Math.floor(height / SPRITE_SIZE);
  let i = 0;
  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < rows; x++) {
      defineSprite({
        sourceRect: {
          x: x * SPRITE_SIZE,
          y: y * SPRITE_SIZE,
        },
        spriteAtlasKey,
        spriteKey: `${spriteAtlasKey}/${i++}.spr`,
      });
    }
  }
}
