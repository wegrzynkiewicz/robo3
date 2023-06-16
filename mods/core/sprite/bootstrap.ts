import { DEFAULT_GAME_OBJECT_SPRITE_INDEX } from "../vars.ts";
import { defineSprite, defineSpriteAtlas } from "./defining.ts";

const spriteAtlasKey = "core/atlas/special.sat";

defineSpriteAtlas({
  image: {
    width: 96,
    height: 32,
    source: "./assets/special-sprite-atlas.png",
  },
  spriteAtlasKey,
});

defineSprite({
  positionIndex: 1,
  predefinedSpriteIndex: DEFAULT_GAME_OBJECT_SPRITE_INDEX,
  spriteAtlasKey,
  spriteKey: "core/special/default.spr",
});
