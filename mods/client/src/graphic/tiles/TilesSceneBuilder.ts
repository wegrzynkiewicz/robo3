import { PerformanceCounter } from "../../../../common/PerformanceCounter.ts";
import { ChunkId } from "../../../../core/chunk/chunkId.ts";
import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { SCREEN_MAX_VISIBLE_TILE_X, SCREEN_MAX_VISIBLE_TILE_Y } from "../../../../core/vars.ts";
import { Chunk, ChunkManager, chunkManagerService } from "../../../../domain-client/chunk/chunkManager.ts";
import { Point } from "../../../../math/Point.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { Viewport, viewportService } from "../Viewport.ts";
import { tilesBufferService } from "./tilesBuffer.ts";

const ter = {
  "LQ": 65,
  "UW": 66,
  "LE": 67,
  "CQ": 68,
  "EW": 69,
  "CE": 70,
  "UA": 71,
  "HS": 72,
  "UD": 73,
  "EA": 74,
  "FS": 75,
  "ED": 76,
  "LZ": 77,
  "UX": 78,
  "LC": 79,
  "CZ": 80,
  "ES": 81,
  "CC": 82,
};

const shadow = new Uint16Array(18);

shadow[0b0000] = ter["HS"];
shadow[0b0001] = ter["UD"];
shadow[0b0010] = ter["UA"];
shadow[0b0011] = 0;
shadow[0b0100] = ter["UX"];
shadow[0b0101] = ter["LC"];
shadow[0b0110] = ter["LZ"];
shadow[0b0111] = ter["ES"];
shadow[0b1000] = ter["UW"];
shadow[0b1001] = ter["LE"];
shadow[0b1010] = ter["LQ"];
shadow[0b1011] = ter["EW"];
shadow[0b1100] = 0;
shadow[0b1101] = ter["ED"];
shadow[0b1110] = ter["EA"];
shadow[0b1111] = ter["FS"];

export class TilesSceneBuilder {
  public visibleTiles = 0;
  public readonly visibleChunks: Chunk[] = [];
  public readonly depthMap: Uint8Array;
  public readonly performance = new PerformanceCounter("scene-builder", 60);
  public readonly layers: Uint8Array[];
  protected paintedLayerCount = 0;
  protected totalCellCountPerLayer = 0;
  protected currentCellCountPerLayer = 0;
  protected paintedDepthCellCount = 0;
  protected layerSize: Point;
  public constructor(
    public readonly chunkManager: ChunkManager,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {
    this.layerSize = { x: SCREEN_MAX_VISIBLE_TILE_X, y: SCREEN_MAX_VISIBLE_TILE_Y };
    this.totalCellCountPerLayer = SCREEN_MAX_VISIBLE_TILE_Y * SCREEN_MAX_VISIBLE_TILE_X;
    this.depthMap = new Uint8Array(this.totalCellCountPerLayer);

    this.layers = [
      new Uint8Array(this.totalCellCountPerLayer),
      new Uint8Array(this.totalCellCountPerLayer),
      new Uint8Array(this.totalCellCountPerLayer),
      new Uint8Array(this.totalCellCountPerLayer),
      new Uint8Array(this.totalCellCountPerLayer),
    ];

    this.activeLayer = this.layers[0];
    this.row = this.layerSize.x;
  }

  public getChunks() {
    const { centerChunk: { x, y }, layer: z } = this.viewport;
    const spaceId = 1;
    const ids = [
      new ChunkId(spaceId, x - 1, y - 1, z - 0),
      new ChunkId(spaceId, x + 0, y - 1, z - 0),
      new ChunkId(spaceId, x + 1, y - 1, z - 0),
      new ChunkId(spaceId, x - 1, y + 0, z - 0),
      new ChunkId(spaceId, x + 0, y + 0, z - 0),
      new ChunkId(spaceId, x + 1, y + 0, z - 0),
      new ChunkId(spaceId, x - 1, y + 1, z - 0),
      new ChunkId(spaceId, x + 0, y + 1, z - 0),
      new ChunkId(spaceId, x + 1, y + 1, z - 0),
    ];

    const chunks: Chunk[] = [];
    for (const id of ids) {
      this.addChunk(chunks, id);
    }
    return chunks;
  }

  public addChunk(chunks: Chunk[], chunkId: ChunkId): void {
    const chunk = this.chunkManager.chunks.get(chunkId.toHex());
    if (chunk && chunk.segment) {
      chunks.unshift(chunk);
      const deepChunkId = new ChunkId(
        chunkId.spaceId,
        chunkId.x,
        chunkId.y,
        chunkId.z - 1,
      );
      this.addChunk(chunks, deepChunkId);
    }
  }

  public buildChunk(chunk: Chunk) {
    const { tilesRect } = this.viewport;
    const { chunkId, segment } = chunk;
    const layer = this.activeLayer;
    const view = segment!.grid.view;
    const chunkTileX = chunkId.x * 32;
    const chunkTileY = chunkId.y * 32;

    const srcX1 = Math.max(tilesRect.x1 - chunkTileX, 0);
    const srcY1 = Math.max(tilesRect.y1 - chunkTileY, 0);
    const srcX2 = Math.min(tilesRect.x2 - chunkTileX, 32);
    const srcY2 = Math.min(tilesRect.y2 - chunkTileY, 32);
    const dstX1 = Math.max(chunkTileX - tilesRect.x1, 0);
    const dstY1 = Math.max(chunkTileY - tilesRect.y1, 0);

    let dstY = dstY1;
    for (let y = srcY1; y < srcY2; y++) {
      let dstX = dstX1;
      for (let x = srcX1; x < srcX2; x++) {
        const dstIndex = dstY * SCREEN_MAX_VISIBLE_TILE_X + dstX;
        if (this.depthMap[dstIndex] === 0) {
          const srcIndex = y * 32 + x;
          const goTypeId = view[srcIndex];
          if (goTypeId !== 0) {
            this.paintedDepthCellCount++;
            this.depthMap[dstIndex] = this.currentLayerIndex;
          }
          layer[dstIndex] = goTypeId;
        }
        dstX++;
      }
      dstY++;
    }
  }

  public buildLayer() {
    const { chunkRect, layer, spaceId } = this.viewport;
    this.activeLayer.fill(0);

    for (let chunkY = chunkRect.y1; chunkY <= chunkRect.y2; chunkY++) {
      for (let chunkX = chunkRect.x1; chunkX <= chunkRect.x2; chunkX++) {
        const chunkId = new ChunkId(spaceId, chunkX, chunkY, this.currentLayerIndex);
        const chunk = this.chunkManager.chunks.get(chunkId.toHex());
        if (chunk === undefined || chunk.segment === undefined) {
          continue;
        }
        this.buildChunk(chunk);
      }
    }
  }

  index = 0;

  tiles: any = [];

  activeLayer: Uint8Array;
  row = 0;

  public pushTile(x: number, y: number, z: number, v: number): void {
    const { tilesRect, layer: depth } = this.viewport;
    const startX = tilesRect.x1;
    const startY = tilesRect.y1;
    this.tiles.push({
      x: (startX + x) * 32,
      y: (startY + y) * 32,
      z: depth - z,
      v,
    });
  }

  public processTile(x: number, y: number) {
    const z = this.currentLayerIndex;
    const vs = this.activeLayer[(y + 0) * this.row + (x + 0)];

    if (vs === 0) {
      const vw = this.activeLayer[(y - 1) * this.row + (x + 0)] === 0 ? 0b1000 : 0;
      const vx = this.activeLayer[(y + 1) * this.row + (x + 0)] === 0 ? 0b0100 : 0;
      const va = this.activeLayer[(y + 0) * this.row + (x - 1)] === 0 ? 0b0010 : 0;
      const vd = this.activeLayer[(y + 0) * this.row + (x + 1)] === 0 ? 0b0001 : 0;

      const vq = this.activeLayer[(y - 1) * this.row + (x - 1)] === 0 ? 0 : 1;
      const ve = this.activeLayer[(y - 1) * this.row + (x + 1)] === 0 ? 0 : 1;
      const vz = this.activeLayer[(y + 1) * this.row + (x - 1)] === 0 ? 0 : 1;
      const vc = this.activeLayer[(y + 1) * this.row + (x + 1)] === 0 ? 0 : 1;

      if (vw && va && vq) {
        this.pushTile(x, y, z, ter['CC']);
      }
      if (vw && vd && ve) {
        this.pushTile(x, y, z, ter['CZ']);
      }
      if (vx && va && vz) {
        this.pushTile(x, y, z, ter['CE']);
      }
      if (vx && vd && vc) {
        this.pushTile(x, y, z, ter['CQ']);
      }

      const v = vw | vx | va | vd;

      switch (v) {
        case 0b0000:
        case 0b0001:
        case 0b0010:
        case 0b0100:
        case 0b0101:
        case 0b0110:
        case 0b0111:
        case 0b1000:
        case 0b1001:
        case 0b1010:
        case 0b1011:
        case 0b1101:
        case 0b1110: {
          this.pushTile(x, y, z, shadow[v]);
          break;
        }
        case 0b1100: {
          this.pushTile(x, y, z, ter['EA']);
          this.pushTile(x, y, z, ter['ED']);
          break;
        }
        case 0b0011: {
          this.pushTile(x, y, z, ter['EW']);
          this.pushTile(x, y, z, ter['ES']);
          break;
        }
        case 0b1111:
          break;
      }


      this.pushTile(x, y, z, ter['FS']);
    } else {
      this.pushTile(x, y, z, vs);
    }
  }

  public processLayer() {
    const { layer } = this.viewport;
    for (let y = 0; y < this.layerSize.y; y++) {
      for (let x = 0; x < this.layerSize.x; x++) {
        const index = y * this.layerSize.x + x;
        const depth = this.depthMap[index];
        if (depth <= this.currentLayerIndex) {
          this.processTile(x, y);
        }
      }
    }
  }

  currentLayerIndex = 0;

  public build() {
    const { tilesRect } = this.viewport;
    this.performance.start();
    const { layer, spaceRect } = this.viewport;
    this.visibleTiles = 0;
    this.visibleChunks.splice(0);
    this.tiles.splice(0);
    this.depthMap.fill(0);

    const tilesCountY = Math.max(tilesRect.y2, 0) - Math.max(tilesRect.y1, 0);
    const tilesCountX = Math.max(tilesRect.x2, 0) - Math.max(tilesRect.x1, 0);
    const overflow = this.totalCellCountPerLayer - tilesCountY * tilesCountX;
    this.currentCellCountPerLayer = this.totalCellCountPerLayer - overflow;

    this.paintedLayerCount = 0;
    this.paintedDepthCellCount = 0;

    const end = Math.min(4, layer);
    for (let z = 0; z <= end; z++) {
      this.activeLayer = this.layers[z];
      this.currentLayerIndex = layer - z;
      this.buildLayer();
      this.paintedLayerCount++;
      if (this.paintedDepthCellCount === this.currentCellCountPerLayer) {
        break;
      }
    }

    for (let z = this.paintedLayerCount - 1; z >= 0; z--) {
      this.currentLayerIndex = layer - z;
      this.activeLayer = this.layers[z];
      this.processLayer();
    }

    let index = 0;
    const view = this.tilesBuffer.typedArray;
    this.tiles.sort((a: any, b: any) => b.z - a.z);
    for (const tile of this.tiles) {
      view[index++] = tile.x;
      view[index++] = tile.y;
      view[index++] = 32.0;
      view[index++] = 32.0;
      view[index++] = index2coords(tile.v)[0] * 32.0;
      view[index++] = index2coords(tile.v)[1] * 32.0;
      view[index++] = 0;
      view[index++] = 0;
      this.visibleTiles++;
    }

    this.tilesBuffer.update(this.visibleTiles * 32);
    this.performance.end();
  }
}

export const tilesSceneBuilderService = registerService({
  async provider(resolver: ServiceResolver): Promise<TilesSceneBuilder> {
    return new TilesSceneBuilder(
      await resolver.resolve(chunkManagerService),
      await resolver.resolve(viewportService),
      await resolver.resolve(tilesBufferService),
    );
  },
});
