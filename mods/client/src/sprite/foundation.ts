import { throws } from "../../../common/asserts.ts";
import { Registry } from "../../../common/registry.ts";
import { SpriteAtlasDefinition, SpriteDefinition } from "../../../core/sprite/defining.ts";
import { createContext2D, getTilesFromCanvasContext } from "./helpers.ts";
import { loadImage } from "./load-image.ts";

export interface Sprite {
  atlas: SpriteAtlas;
  spriteKey: string;
  spriteIndex: number;
  image: ImageData;
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
  const imageDataByAtlas = new WeakMap<SpriteAtlas, ImageData[]>();
  for (const atlas of atlases.values()) {
    const { image } = atlas;
    const { height, width } = image;
    const sourceContext = createContext2D(width, height);
    sourceContext.drawImage(image, 0, 0);
    const imageGenerator = getTilesFromCanvasContext(sourceContext);
    const imagesData = [...imageGenerator];
    imageDataByAtlas.set(atlas, imagesData);
  }
  const sprites = new Map<string, Sprite>();
  const spritesDefinitions = [...spriteRegistry.entities.values()];
  for (const spriteDefinition of spritesDefinitions) {
    const { positionIndex, spriteAtlasKey, spriteKey, predefinedSpriteIndex } = spriteDefinition;
    const atlas = atlases.get(spriteAtlasKey);
    if (atlas === undefined) {
      throws("cannot-find-sprite-atlas-by-key", {
        spriteAtlasKey,
        spriteDefinition,
      });
    }
    const imagesData = imageDataByAtlas.get(atlas)!;
    const image = imagesData[positionIndex];
    if (image === undefined) {
      throws("cannot-fetch-image-data-from-atlas-by-position-index", {
        atlas,
        positionIndex,
        spriteDefinition,
      });
    }
    const sprite: Sprite = {
      atlas,
      image,
      spriteIndex: predefinedSpriteIndex ?? 0,
      spriteKey,
    };
    sprites.set(spriteKey, sprite);
  }
  return sprites;
}

// const url = new URL(`${window.location}assets/${imagePath}`);
// const resource = await imageManager.loadImage({
//   height: imageheight,
//   imageId: url.toString(),
//   src: url.toString(),
//   width: imagewidth,
// });

// const { image } = resource;
// const sourceContext = createContext2D(image.width, image.height);
// sourceContext.drawImage(image, 0, 0);
// const tiles = getTilesFromCanvasContext(sourceContext);
// let currentTileIndex = 0;
// for (const tileImageData of tiles) {
//   const { spriteIndex } = tilesTextureAllocator.insert(tileImageData);
// }
