import { throws } from "../../../common/asserts.ts";
import { Registry } from "../../../common/registry.ts";
import { SpriteAtlasDefinition, SpriteDefinition } from "../../../core/sprite/defining.ts";
import { loadImage, createContext2D } from "../helpers/image-processing.ts";

export interface Sprite {
  atlas: SpriteAtlas;
  definition: SpriteDefinition,
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
  for (const definition of spritesDefinitions) {
    let { height, spriteAtlasKey, spriteKey, width, x, y } = definition;
    const atlas = atlases.get(spriteAtlasKey);
    if (atlas === undefined) {
      throws("cannot-find-sprite-atlas-by-key", {
        spriteAtlasKey,
        definition,
      });
    }
    width = width ?? 32;
    height = height ?? 32;
    const canvas = contexts.get(atlas)!;
    const image = canvas.getImageData(x, y, width, height);
    if (image === undefined) {
      throws("cannot-fetch-image-data-from-atlas-by-position-index", { atlas, definition });
    }
    if (image.height !== height || image.width !== width) {
      throws("invalid-image-dimensions", { definition });
    }
    const sprite: Sprite = {
      atlas,
      definition,
      height,
      image,
      spriteIndex: 0,
      spriteKey,
      width,
    };
    sprites.set(spriteKey, sprite);
  }
  return sprites;
}
