import { assertArray, assertObject, assertPositiveNumber, assertRequiredString, assertTrue, Breaker } from "../common/asserts.ts";
import { BrowserImageManager } from "../core/image.ts";
import { createContext2D, getTilesFromCanvasContext, Tile, TilesTextureAllocator } from "../core/tile.ts";
import { SPRITE_SIZE, SPRITES_TEXTURE_SIZE, TILES_PER_CHUNK_GRID, TILES_PER_CHUNK_GRID_AXIS } from "../core/vars.ts";

interface TiledMap {
  //   backgroundcolor?: string;
  //   class?: string;
  //   compressionlevel?: number;
  //   height: number;
  //   hexsidelength?: number;
  infinite: boolean;
  layers: TiledLayer[];
  //   nextlayerid: number;
  //   nextobjectid: number;
  orientation: string;
  //   parallaxoriginx?: number;
  //   parallaxoriginy?: number;
  //   properties?: Property[];
  //   renderorder: 'right-down' | 'right-up' | 'left-down' | 'left-up';
  //   staggeraxis?: 'x' | 'y';
  //   staggerindex?: 'odd' | 'even';
  //   tiledversion: string;
  tileheight: number;
  //   tilesets: Tileset[];
  tilewidth: number;
  //   type: 'map';
  //   version: string;
  //   width: number;
}

interface TiledLayer {
  chunks: TiledChunk[];
  //   class?: string;
  //   compression?: 'zlib' | 'gzip' | 'zstd' | '';
  //   data?: number[] | string;
  //   draworder?: 'topdown' | 'index';
  //   encoding?: 'csv' | 'base64';
  height: number;
  id: number;
  //   image?: string;
  layers: TiledLayer[];
  //   locked?: boolean;
  //   name: string;
  //   objects?: any[]; // typ obiektów należy dostosować
  offsetx: number;
  offsety: number;
  //   opacity?: number;
  //   parallaxx?: number;
  //   parallaxy?: number;
  properties: TiledProperty[];
  //   repeatx?: boolean;
  //   repeaty?: boolean;
  //   startx?: number;
  //   starty?: number;
  //   tintcolor?: string;
  //   transparentcolor?: string;
  type: string;
  //   visible?: boolean;
  width: number;
  x: number;
  y: number;
}

export interface TiledChunk {
  data: number[] | string;
  height: number;
  width: number;
  x: number;
  y: number;
}

interface TiledProperty {
  name: string;
  type: string;
  value: unknown;
}

interface TiledTile {
  id: number;
  properties: TiledProperty[];
}

interface TiledSet {
  firstgid: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  properties: TiledProperty[];
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
  public readonly chunkManager = new ChunkManager();
}

class ChunkManager {
  public binaries: Uint16Array[] = [];
  createChunk(
    { binary }: {
      binary: Uint16Array;
    },
  ) {
    this.binaries.push(binary);
  }
}

async function processTileSet(ctx: LoadingContext, data: unknown) {
  const { imageManager, tilesTextureAllocator } = ctx;

  assertObject<TiledSet>(data, "invalid-tile-set-structure");
  const { image: imagePath, imageheight, imagewidth, margin, tilecount, tileheight, tilewidth, spacing, version } = data;
  assertRequiredString(imagePath, "tile-set-image-should-be-required-string", { data, image: imagePath });
  assertPositiveNumber(imagewidth, "tile-set-image-width-should-be-positive-number", { data, imagewidth });
  assertPositiveNumber(imageheight, "tile-set-image-height-should-be-positive-number", { data, imageheight });
  assertPositiveNumber(tilecount, "tile-set-tile-count-should-be-positive-number", { data, tilecount });
  assertTrue(tilewidth === SPRITE_SIZE, `tile-set-tile-width-should-be-${SPRITE_SIZE}`, { data, tilewidth });
  assertTrue(tileheight === SPRITE_SIZE, `tile-set-tile-height-should-be-${SPRITE_SIZE}`, { data, tileheight });
  assertTrue(spacing === 0, "tile-set-spacing-should-be-0", { data, spacing });
  assertTrue(margin === 0, "tile-set-margin-should-be-0", { data, margin });
  assertTrue(version === "1.10", "tile-set-version-should-be-1-10", { data, version });

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
  }
}

export async function processMap() {
  const ctx = new LoadingContext();
  const request = await fetch("./assets/kafelki.tsj");
  const json = await request.json();
  await processTileSet(ctx, json);

  ctx.tilesTextureAllocator.paintHelperTiles();
  ctx.tilesTextureAllocator.contexts.map((c) => document.body.appendChild(c.canvas));
  const dataSource = ctx.tilesTextureAllocator.contexts[0].getImageData(0, 0, SPRITES_TEXTURE_SIZE, SPRITES_TEXTURE_SIZE);
  return dataSource;
}

export async function processMap1() {
  const ctx = new LoadingContext();
  const request = await fetch("./assets/test2.tmj");
  const json = await request.json();

  await processMap2(ctx, json);
  return ctx.chunkManager;
}

async function processLayer(ctx: LoadingContext, layer: unknown) {
  assertObject<TiledLayer>(layer, "invalid-tiled-map-structure");
  const { chunks, id: layerId, type, layers } = layer;
  switch (type) {
    case "group":
      assertArray(layers, "tiled-layers-of-layers-should-be-array", { layerId });
      for (const layer of layers) {
        await processLayer(ctx, layer);
      }
      break;
    case "tilelayer":
      assertTrue(type === "tilelayer", `tiled-layer-type-should-be-tilelayer`, { layerId });
      assertArray(chunks, "tiled-chunks-should-be-array", { layerId });
      assertTrue(chunks.length >= 1, "tiled-chunks-length-should-be-greater-than-or-equal--1", { layerId });
      for (const [chunkIndex, tiledChunk] of Object.entries(chunks)) {
        assertObject<TiledChunk>(tiledChunk, "invalid-tiled-chunk-structure");
        const { data, height, width, x, y } = tiledChunk;
        const size = TILES_PER_CHUNK_GRID_AXIS;
        const area = TILES_PER_CHUNK_GRID;
        assertTrue(width === size, `tiled-chunk-width-should-be-${size}`, { chunkIndex, layerId, width });
        assertTrue(height === size, `tiled-chunk-height-should-be-${size}`, { chunkIndex, layerId, height });
        assertArray(data, "tiled-chunks-data-should-be-array", { chunkIndex, layerId });
        assertTrue(data.length > 1, `tiled-chunks-data-length-should-be-${area}`, { chunkIndex, layerId });
        const binary = new Uint16Array(TILES_PER_CHUNK_GRID);
        binary.set(data.map((e) => (e ?? 1)));
        ctx.chunkManager.createChunk({ binary });
      }
      break;
    default:
      throw new Breaker("tiled-layer-type-in-not-supported", { layerId, type });
  }
}

async function processMap2(ctx: LoadingContext, data: unknown) {
  assertObject<TiledMap>(data, "invalid-tiled-map-structure");
  const { infinite, orientation, tileheight, tilewidth, layers } = data;
  assertTrue(infinite, `tiled-map-should-be-infinite`);
  assertTrue(orientation === "orthogonal", `tiled-map-orientation-should-be-orthogonal`, { orientation });
  assertTrue(tilewidth === SPRITE_SIZE, `tiled-map-tile-width-should-be-${SPRITE_SIZE}`, { tilewidth });
  assertTrue(tileheight === SPRITE_SIZE, `tiled-map-tile-height-should-be-${SPRITE_SIZE}`, { tileheight });
  assertTrue(tileheight === SPRITE_SIZE, `tiled-map-tile-height-should-be-${SPRITE_SIZE}`, { tileheight });
  assertArray(layers, "tiled-layers-should-be-array");
  assertTrue(layers.length > 1, "tiled-layers-length-should-be-greater-than-1");

  for (const layer of layers) {
    await processLayer(ctx, layer);
  }
}

export function createChunkBinary() {
  new Uint16Array(TILES_PER_CHUNK_GRID);
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
//       currentTargetContext = createContext2D(SPRITES_TEXTURE_SIZE, SPRITES_TEXTURE_SIZE);
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

//   const targetContext = createContext2D(SPRITES_TEXTURE_SIZE, SPRITES_TEXTURE_SIZE);
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
