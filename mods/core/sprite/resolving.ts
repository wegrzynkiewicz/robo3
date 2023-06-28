import { assertPositiveNumber, throws } from "../../common/asserts.ts";
import { Registry } from "../../common/registry.ts";
import { SpriteAtlasDefinition, SpriteDefinition } from "./defining.ts";
import { SpriteAtlas, Sprite } from "./foundation.ts";

export function resolveSpriteAtlas(
  spriteAtlasDefinition: SpriteAtlasDefinition,
): SpriteAtlas {
  const { image, spriteAtlasKey } = spriteAtlasDefinition;
  const { height, source, width } = image;
  const spriteAtlas: SpriteAtlas = {
    spriteAtlasKey,
    image: {
      height,
      source,
      width,
    },
  };
  return spriteAtlas;
}

export function resolveSpriteAtlases(
  registry: Registry<SpriteAtlasDefinition>,
): Map<string, SpriteAtlas> {
  const defs = [...registry.entities.values()];
  const atlases = defs.map(resolveSpriteAtlas);
  const map = new Map<string, SpriteAtlas>(
    atlases.map((a) => [a.spriteAtlasKey, a]),
  );
  return map;
}

export function resolveSprites(
  { atlases, spriteRegistry }: {
    atlases: Map<string, SpriteAtlas>;
    spriteRegistry: Registry<SpriteDefinition>;
  },
): Map<string, Sprite> {
  const sprites = new Map<string, Sprite>();
  const spritesDefinitions = [...spriteRegistry.entities.values()];
  for (const definition of spritesDefinitions) {
    const { sourceRect, spriteAtlasKey, spriteKey } = definition;
    let { h, w, x, y } = sourceRect;
    assertPositiveNumber(x, "sprite-source-rect-x-should-be-number", { definition });
    assertPositiveNumber(y, "sprite-source-rect-y-should-be-number", { definition });
    const atlas = atlases.get(spriteAtlasKey);
    if (atlas === undefined) {
      throws("cannot-find-sprite-atlas-by-key", {
        spriteAtlasKey,
        definition,
      });
    }
    w = w ?? 32;
    h = h ?? 32;
    const sprite: Sprite = {
      atlas,
      definition,
      sourceRect: {
        h, w, x, y
      },
      spriteKey,
    };
    sprites.set(spriteKey, sprite);
  }
  return sprites;
}
