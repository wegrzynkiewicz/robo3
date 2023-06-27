import { throws } from "../../../common/asserts.ts";
import { Registry } from "../../../common/registry.ts";
import { SpriteAtlasDefinition, SpriteDefinition } from "../../../core/sprite/defining.ts";
import { createContext2D } from "./helpers.ts";
import { loadImage } from "./load-image.ts";

export interface Sprite {
  atlas: SpriteAtlas;
  height: number;
  image: ImageData;
  spriteIndex: number;
  spriteKey: string;
  width: number;
}

export interface SpriteAtlas {
  image: HTMLImageElement;
  spriteAtlasKey: string;
}

export async function resolveSpriteAtlas(
  spriteAtlasDefinition: SpriteAtlasDefinition,
): Promise<SpriteAtlas> {
  const { image, spriteAtlasKey } = spriteAtlasDefinition;
  const { height, source, width } = image;
  const htmlImage = await loadImage({ height, source, width });
  const spriteAtlas: SpriteAtlas = {
    spriteAtlasKey,
    image: htmlImage,
  };
  return spriteAtlas;
}

export async function resolveSpriteAtlases(
  registry: Registry<SpriteAtlasDefinition>,
): Promise<Map<string, SpriteAtlas>> {
  const defs = [...registry.entities.values()];
  const promises = defs.map(resolveSpriteAtlas);
  const atlases = await Promise.all(promises);
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
  const contexts = new WeakMap<SpriteAtlas, CanvasRenderingContext2D>();
  for (const atlas of atlases.values()) {
    const { image } = atlas;
    const { height, width } = image;
    const sourceContext = createContext2D(width, height);
    sourceContext.drawImage(image, 0, 0);
    contexts.set(atlas, sourceContext);
  }
  const sprites = new Map<string, Sprite>();
  const spritesDefinitions = [...spriteRegistry.entities.values()];
  for (const spriteDefinition of spritesDefinitions) {
    let { height, spriteAtlasKey, spriteKey, predefinedSpriteIndex, width, x, y } = spriteDefinition;
    const atlas = atlases.get(spriteAtlasKey);
    if (atlas === undefined) {
      throws("cannot-find-sprite-atlas-by-key", {
        spriteAtlasKey,
        spriteDefinition,
      });
    }
    width = width ?? 32;
    height = height ?? 32;
    const canvas = contexts.get(atlas)!;
    const image = canvas.getImageData(x, y, width, height);
    if (image === undefined) {
      throws("cannot-fetch-image-data-from-atlas-by-position-index", { atlas, spriteDefinition });
    }
    if (image.height !== height || image.width !== width) {
      throws("invalid-image-dimensions", { spriteDefinition });
    }
    const sprite: Sprite = {
      atlas,
      height,
      image,
      spriteIndex: predefinedSpriteIndex ?? 0,
      spriteKey,
      width,
    };
    sprites.set(spriteKey, sprite);
  }
  return sprites;
}
