import {
  assertObject,
  assertPositiveNumber,
  assertRequiredString,
  assertTrue,
} from "../common/asserts.ts";
import { BrowserImageManager } from "../core/image.ts";
import { Tile, TilesTextureAllocator, createContext2D, getTilesFromCanvasContext } from "../core/tile.ts";
import { TILE_SIZE, TILES_TEXTURE_SIZE } from "../core/vars.ts";

interface Property {
  name: string;
  type: string;
  value: unknown;
}

interface TiledTile {
  id: number;
  properties: Property[];
}

interface TileSet {
  firstgid: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  properties: Property[];
  spacing: number;
  tilecount: number;
  tileheight: number;
  tiles: TiledTile[];
  tilewidth: number;
  version: string;
}

class LoadingContext {
  public readonly tilesTextureAllocator = new TilesTextureAllocator();
  public readonly imageManager = new BrowserImageManager();
}

async function processTileSet(ctx: LoadingContext, data: unknown) {
  const { imageManager, tilesTextureAllocator } = ctx;

  assertObject<TileSet>(data, "invalid-tile-set-structure");
  const { image: imagePath, imageheight, imagewidth, margin, tilecount, tileheight, tilewidth, spacing, version } = data;
  assertRequiredString(imagePath, "tile-set-image-should-be-required-string", { data, image: imagePath });
  assertPositiveNumber(imagewidth, "tile-set-image-width-should-be-positive-number", { data, imagewidth });
  assertPositiveNumber(imageheight, "tile-set-image-height-should-be-positive-number", { data, imageheight });
  assertPositiveNumber(tilecount, "tile-set-tile-count-should-be-positive-number", { data, tilecount });
  assertTrue(tilewidth === TILE_SIZE, `tile-set-tile-height-should-be-${TILE_SIZE}`, { data, tilewidth });
  assertTrue(tileheight === TILE_SIZE, `tile-set-tile-height-should-be-${TILE_SIZE}`, { data, tileheight });
  assertTrue(spacing === 0, "tile-set-spacing-should-be-0", { data, spacing });
  assertTrue(margin === 0, "tile-set-margin-should-be-0", { data, margin });
  assertTrue(version === '1.10', "tile-set-version-should-be-1-10", { data, version });

  const url = new URL(`${window.location}assets/${imagePath}`);
  const resource = await imageManager.loadImage({
    height: imageheight,
    imageId: url.toString(),
    src: url.toString(),
    width: imagewidth,
  });

  const { image } = resource;
  const sourceContext = createContext2D(image.width, image.height);
  sourceContext.drawImage(image, 0, 0);
  const tiles = getTilesFromCanvasContext(sourceContext);
  let currentTileIndex = 0;
  for (const tileImageData of tiles) {
    const { spriteIndex } = tilesTextureAllocator.insert(tileImageData);
    // const tile: Tile = {
  }
}

export async function processMap() {
  const ctx = new LoadingContext();
  const request = await fetch("./assets/kafelki.tsj");
  const json = await request.json();
  await processTileSet(ctx, json);

  ctx.tilesTextureAllocator.paintHelperTiles();
  ctx.tilesTextureAllocator.contexts.map((c) => document.body.appendChild(c.canvas));
  const dataSource = ctx.tilesTextureAllocator.contexts[0].getImageData(0, 0, TILES_TEXTURE_SIZE, TILES_TEXTURE_SIZE);
  return dataSource;
}

interface TileAtlas {
  image: HTMLImageElement;
}

// interface

// function* addFirstTile(
//   startTextureIndex: number,
//   generator: Generator<ImageData, void, unknown>
// ): Generator<ImageData, void, number> {
//   const firstTile = createTextureTileHelper(0x00, 0xff, 0xff);
//   for (const tile of generator) {
//     yield tile;
//   }
//   textureIndex
// }

// interface ImageRect {
//   x: T,
//   y: T,
// }

// interface TextureCoords<T> {
//   x: T,
//   y: T,
//   z: T,
// }


// function loadTiles(
//   { tileAtlases }: {
//     tileAtlases: TileAtlas[],
//   },
// ): CanvasRenderingContext2D[] {
//   const firstTile = createTextureTileHelper(0x00, 0xff, 0xff);
//   const contexts: CanvasRenderingContext2D[] = [];
//   let memoryZ = -1;
//   let textureIndex = 0;
//   let currentTargetContext: CanvasRenderingContext2D;
//   function resolveImageRect(): [number, number] {
//     const [x, y, z] = index2coords(textureIndex);
//     const [s, t] = coords2ImageRect(x, y);
//     if (z !== memoryZ) {
//       memoryZ = z;
//       currentTargetContext = createContext2D(TILES_TEXTURE_SIZE, TILES_TEXTURE_SIZE);
//       contexts.push(currentTargetContext);
//       currentTargetContext.putImageData(firstTile, s, t);
//       textureIndex++;
//       const [x, y] = index2coords(textureIndex);
//       return coords2ImageRect(x, y);
//     }
//     return [s, t];
//   }
//   for (const atlas of tileAtlases) {
//     const { image } = atlas;
//     const sourceContext = createContext2D(image.width, image.height);
//     sourceContext.drawImage(image, 0, 0);
//     const tiles = getTilesFromCanvasContext(sourceContext);
//     for (const tileImage of tiles) {
//       const [s, t] = resolveImageRect();
//       currentTargetContext!.putImageData(tileImage, s, t);
//       textureIndex++;
//     }
//   }
//   contexts.map(c =>
//     document.body.appendChild(c.canvas));
//   return contexts
// }

// function loadTile(image: HTMLImageElement): ImageData {
//   const sourceContext = createContext2D(image.width, image.height);
//   sourceContext.drawImage(image, 0, 0);

//   const targetContext = createContext2D(TILES_TEXTURE_SIZE, TILES_TEXTURE_SIZE);
//   const tiles = getTilesFromCanvasContext(sourceContext);

//   const firstTile = createTextureTileHelper(5, 5, 5);
//   const [x, y] = index2coords(0);
//   const [s, t] = coords2ImageRect(x, y);
//   targetContext.putImageData(firstTile, s, t);

//   let textureIndex = 1;
//   for (const tileImage of tiles) {
//     const [x, y, z] = index2coords(textureIndex);
//     if (z === 1) {
//       break;
//     }
//     const [s, t] = coords2ImageRect(x, y);
//     targetContext.putImageData(tileImage, s, t);
//     textureIndex++;
//   }

//   //   document.body.replaceChildren();
//   //   document.body.appendChild(targetContext.canvas);
//   const { height, width } = targetContext.canvas;
//   targetContext.getImageData(0, 0, width, height);
//   return targetContext.getImageData(0, 0, width, height);
// }

// const buffer = Deno.readFileSync('/home/lukasz/robo3/kafelki.tsj');
// const textDecoder = new TextDecoder();
// const json = textDecoder.decode(buffer);
// const data = JSON.parse(json);

// processTileSet(data);
