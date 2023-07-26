import { DEFAULT_GAME_OBJECT_SPRITE_INDEX, ERROR_GAME_OBJECT_SPRITE_INDEX, UNDEFINED_GAME_OBJECT_SPRITE_INDEX } from "../vars.ts";
import { defineSprite, defineSpriteAtlas, defineSpritesFromAtlas } from "./defining.ts";

const spriteAtlasKey = "core/special.sat";

defineSpriteAtlas({
  image: {
    width: 96,
    height: 32,
    source: "./assets/special-sprite-atlas.png",
  },
  spriteAtlasKey,
});

defineSprite({
  predefinedSpriteIndex: ERROR_GAME_OBJECT_SPRITE_INDEX,
  spriteAtlasKey,
  spriteKey: "core/special/error.spr",
  sourceRect: { x: 0, y: 0 },
});

defineSprite({
  predefinedSpriteIndex: UNDEFINED_GAME_OBJECT_SPRITE_INDEX,
  spriteAtlasKey,
  spriteKey: "core/special/undefined.spr",
  sourceRect: { x: 32, y: 0 },
});

defineSprite({
  predefinedSpriteIndex: DEFAULT_GAME_OBJECT_SPRITE_INDEX,
  spriteAtlasKey,
  spriteKey: "core/special/default.spr",
  sourceRect: { x: 64, y: 0 },
});

defineSpriteAtlas({
  image: {
    width: 256,
    height: 4256,
    source: "./assets/tileset.png",
  },
  spriteAtlasKey: "test1",
});

defineSpritesFromAtlas({ spriteAtlasKey: "test1" });
