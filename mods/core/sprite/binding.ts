import { Sprite } from "./foundation.ts";

export interface SpriteBinding {
  spriteIndex: number;
}

export function createSpriteIndexTable(
  { spritesMap }: {
    spritesMap: Map<string, Sprite>;
  }
): Sprite[] {
  const targets: Sprite[] = [];
  for (const sprite of spritesMap.values()) {
    const { predefinedSpriteIndex } = sprite.definition;
    if (predefinedSpriteIndex !== undefined) {
      targets[predefinedSpriteIndex] = sprite;
    }
  }
  let spriteIndex = 0;
  for (const sprite of spritesMap.values()) {
    const { predefinedSpriteIndex } = sprite.definition;
    if (predefinedSpriteIndex === undefined) {
      while (targets[spriteIndex] !== undefined) {
        spriteIndex++;
      }
      targets[spriteIndex] = sprite;
    }
  }
  return targets;
}
