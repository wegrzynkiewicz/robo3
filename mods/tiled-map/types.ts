import { coords2ImageRect, index2coords } from "../client/src/graphic/texture.ts";
import { TILES_TEXTURE_SIZE, TILE_SIZE } from "../client/src/vars.ts";
import {
  assertNonNull,
  assertObject,
  assertPositiveNumber,
  assertRequiredString,
  assertTrue,
} from "../common/asserts.ts";
import { deferred } from "../deps.ts";

interface Grid {
  height: number;
  orientation: string;
  width: number;
}

interface TileOffset {
  x: number;
  y: number;
}

interface Property {
  name: string;
  type: string;
  value: any;
}

interface Tile {
  //   animation: Frame[];
  id: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  //   objectgroup: Layer;
  probability: number;
  properties: Property[];
  terrain: number[];
  type: string;
}

interface TileSet {
  //   backgroundcolor: string;
  //   class: string;
  columns: number;
  fillmode: string;
  firstgid: number;
  grid: Grid;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  objectalignment: string;
  properties: Property[];
  source: string;
  spacing: number;
  terrains: unknown[];
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tileoffset: TileOffset;
  tilerendersize: string;
  tiles: Tile[];
  tilewidth: number;
  //   transformations: Transformations;
  transparentcolor: string;
  type: string;
  version: string;
  //   wangsets: Wangset[];
}

function loadImage(
  { height, src, width }: {
    height: number;
    src: string;
    width: number;
  },
): Promise<HTMLImageElement> {
  const promise = deferred<HTMLImageElement>();
  const image = new Image();
  image.src = src;
  image.onload = () => {
    try {
      assertTrue(image.width === width, "unexpected-image-width", { src, imageWidth: image.width, width });
      assertTrue(image.height === height, "unexpected-image-height", { src, imageHeight: image.height, height });
    } catch (error: unknown) {
      promise.reject(error);
      return;
    }
    promise.resolve(image);
  };
  return promise;
}

async function processTileSet(data: unknown) {
  assertObject<TileSet>(data, "invalid-tile-set-structure");
  const { image, imageheight, imagewidth, tilecount, tileheight, tilewidth } = data;
  assertRequiredString(image, "tile-set-image-should-be-required-string", { data, image });
  assertPositiveNumber(imagewidth, "tile-set-image-width-should-be-positive-number", { data, imagewidth });
  assertPositiveNumber(imageheight, "tile-set-image-height-should-be-positive-number", { data, imageheight });
  assertPositiveNumber(tilecount, "tile-set-tile-count-should-be-positive-number", { data, tilecount });
  assertTrue(tilewidth === 32, "tile-set-tile-height-should-be-32", { data, tilewidth });
  assertTrue(tileheight === 32, "tile-set-tile-height-should-be-32", { data, tileheight });

  const imageSrc = new URL(`${window.location}assets/${image}`);
  const htmlImage = await loadImage({
    height: imageheight,
    src: imageSrc.toString(),
    width: imagewidth,
  });
  return loadTile(htmlImage);
}

export async function processMap() {
  const request = await fetch("./assets/kafelki.tsj");
  const json = await request.json();
  return processTileSet(json);
}

export function createContext2D(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  assertTrue(width % TILE_SIZE === 0, `canvas-width-must-be-multiples-of-${TILE_SIZE}`, { width });
  assertTrue(height % TILE_SIZE === 0, `canvas-height-must-be-multiples-of-${TILE_SIZE}`, { height });
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
    alpha: true,
  });
  assertNonNull(context, "cannot-create-context-from-canvas");
  return context;
}

export function* getTilesFromCanvasContext(context: CanvasRenderingContext2D): Generator<ImageData, void, unknown> {
  const { canvas } = context;
  const { height, width } = canvas;
  const tilesPerWidth = Math.floor(width / TILE_SIZE);
  const tilesPerHeight = Math.floor(height / TILE_SIZE);
  for (let y = 0; y < tilesPerHeight; y++) {
    for (let x = 0; x < tilesPerWidth; x++) {
      const tileImageData = context.getImageData(
        x * TILE_SIZE,
        y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        { colorSpace: "display-p3" }
      );
      yield tileImageData;
    }
  }
}

export function createTextureTileHelper(r: number, g: number, b: number): ImageData {
  const tile = new ImageData(TILE_SIZE, TILE_SIZE);
  const buffer = tile.data;
  let pixelStride = 0;
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const paint = x % 2 === 0 || y % 2 === 0;
      buffer[pixelStride + 0] = paint ? r : 0x00;
      buffer[pixelStride + 1] = paint ? g : 0x00;
      buffer[pixelStride + 2] = paint ? b : 0x00;
      buffer[pixelStride + 3] = 0xFF;
      pixelStride += 4;
    }
  }
  return tile;
}

function loadTile(image: HTMLImageElement): ImageData {
  const sourceContext = createContext2D(image.width, image.height);
  sourceContext.drawImage(image, 0, 0);
  //   const imageData = sourceContext.getImageData(0, 34, 1, 1);

  const targetContext = createContext2D(TILES_TEXTURE_SIZE, TILES_TEXTURE_SIZE);
  const tiles = getTilesFromCanvasContext(sourceContext);

  const firstTile = createTextureTileHelper(0x00, 0xff, 0xff);
  const [x, y] = index2coords(0);
  const [s, t] = coords2ImageRect(x, y);
  targetContext.putImageData(firstTile, s, t);

  let textureIndex = 1;
  for (const tileImage of tiles) {
    const [x, y, z] = index2coords(textureIndex);
    if (z === 1) {
      break;
    }
    const [s, t] = coords2ImageRect(x, y);
    targetContext.putImageData(tileImage, s, t);
    textureIndex++;
  }

//   document.body.replaceChildren();
  document.body.appendChild(targetContext.canvas);
  const { height, width } = targetContext.canvas;
  targetContext.getImageData(0, 0, width, height);
  return targetContext.getImageData(0, 0, width, height);
}

// const buffer = Deno.readFileSync('/home/lukasz/robo3/kafelki.tsj');
// const textDecoder = new TextDecoder();
// const json = textDecoder.decode(buffer);
// const data = JSON.parse(json);

// processTileSet(data);
