import { PerformanceCounter } from "../../../../common/PerformanceCounter.ts";
import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { SpaceManager, spaceManagerService } from "../../../../core/space/SpaceManager.ts";
import { Chunk } from "../../../../domain-client/chunk/chunkManager.ts";
import { cornerRect } from "../../../../math/CornerRectangle.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { Viewport, viewportService } from "../Viewport.ts";
import { SceneViewport, sceneViewportService } from "./SceneViewport.ts";
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
shadow[0b0100] = ter["UX"];
shadow[0b0101] = ter["LC"];
shadow[0b0110] = ter["LZ"];
shadow[0b0111] = ter["ES"];
shadow[0b1000] = ter["UW"];
shadow[0b1001] = ter["LE"];
shadow[0b1010] = ter["LQ"];
shadow[0b1011] = ter["EW"];
shadow[0b1101] = ter["ED"];
shadow[0b1110] = ter["EA"];

const TERRAIN_CELL_BYTE_LENGTH = 2;
const DEPTH_LAYERS_COUNT = 1;
const EMPTY_CELL_VALUE = 0xff;

export class SceneTerrainLayer {
  public paintRect = cornerRect(0, 0, 0, 0);
  public constructor(
    public readonly typedArray: Uint16Array,
  ) {
  }

  public clear(): void {
    this.typedArray.fill(0);
    this.paintRect.x1 = 255;
    this.paintRect.y1 = 255;
    this.paintRect.x2 = 0;
    this.paintRect.y2 = 0;
  }
}

const sortTiles = (a: any, b: any) => a.z - b.z;

export class TilesSceneBuilder {
  public visibleTiles = 0;
  protected activeLayer: SceneTerrainLayer;
  public readonly visibleChunks: Chunk[] = [];
  public readonly performance = new PerformanceCounter("scene-builder", 60);
  protected paintedLayerCount = 0;
  protected paintedDepthCellCount = 0;
  depthLayer: Uint16Array;
  terrainLayers: SceneTerrainLayer[] = [];
  availableCellsPerRowCount: number;
  currentTerrainLevel = 0;
  availableRowsPerLayerCount: number;
  currentLayerIndex = 0;

  public constructor(
    public readonly availableLayerCount: number,
    public readonly spaceManager: SpaceManager,
    public readonly sceneViewport: SceneViewport,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {
    const { cellCount } = this.sceneViewport.grid.available;
    const totalByteLength = cellCount * (availableLayerCount + DEPTH_LAYERS_COUNT) * TERRAIN_CELL_BYTE_LENGTH;
    const buffer = new ArrayBuffer(totalByteLength);
    this.depthLayer = new Uint16Array(buffer, 0, cellCount);
    for (let layerIndex = 0; layerIndex < availableLayerCount; layerIndex++) {
      const byteOffset = cellCount * (layerIndex + 1) * TERRAIN_CELL_BYTE_LENGTH;
      const layerTypedArray = new Uint16Array(buffer, byteOffset, cellCount);
      const layer = new SceneTerrainLayer(layerTypedArray);
      this.terrainLayers.push(layer);
    }
    this.activeLayer = this.terrainLayers[0];
    this.availableRowsPerLayerCount = this.sceneViewport.grid.available.size.y;
    this.availableCellsPerRowCount = this.sceneViewport.grid.available.size.x;
  }

  public buildChunk(chunk: Chunk) {
    const { chunkId, segment } = chunk;
    const view = segment!.grid.view;
    const chunkTileX = chunkId.x * 32;
    const chunkTileY = chunkId.y * 32;

    const tilesRect = this.sceneViewport.tilesRect;
    const srcX1 = Math.max(tilesRect.x1 - chunkTileX, 0);
    const srcY1 = Math.max(tilesRect.y1 - chunkTileY, 0);
    const srcX2 = Math.min(tilesRect.x2 - chunkTileX, 32);
    const srcY2 = Math.min(tilesRect.y2 - chunkTileY, 32);
    const dstX1 = Math.max(chunkTileX - tilesRect.x1, 0);
    const dstY1 = Math.max(chunkTileY - tilesRect.y1, 0);

    this.visibleChunks.push(chunk);

    let dstY = dstY1;
    for (let y = srcY1; y < srcY2; y++) {
      let dstX = dstX1;
      for (let x = srcX1; x < srcX2; x++) {
        const dstIndex = dstY * this.availableCellsPerRowCount + dstX;
        if (this.depthLayer[dstIndex] === EMPTY_CELL_VALUE) {
          const srcIndex = y * 32 + x;
          const goTypeId = view[srcIndex];
          if (goTypeId !== 0) {
            this.activeLayer.paintRect.x1 = Math.min(dstX, this.activeLayer.paintRect.x1);
            this.activeLayer.paintRect.y1 = Math.min(dstY, this.activeLayer.paintRect.y1);
            this.activeLayer.paintRect.x2 = Math.max(dstX, this.activeLayer.paintRect.x2);
            this.activeLayer.paintRect.y2 = Math.max(dstY, this.activeLayer.paintRect.y2);
            this.depthLayer[dstIndex] = this.currentTerrainLevel;
            this.paintedDepthCellCount++;
          }
          this.activeLayer.typedArray[dstIndex] = goTypeId;
        }
        dstX++;
      }
      dstY++;
    }
  }

  public buildLayer() {
    const { chunkRect, spaceId } = this.sceneViewport;
    const space = this.spaceManager.obtain(spaceId);
    this.activeLayer.clear();
    for (let chunkY = chunkRect.y1; chunkY <= chunkRect.y2; chunkY++) {
      for (let chunkX = chunkRect.x1; chunkX <= chunkRect.x2; chunkX++) {
        const chunk = space.chunkManager.getByCoords(chunkX, chunkY, this.currentTerrainLevel);
        if (chunk === undefined || chunk.segment === undefined || chunk.tiles === undefined) {
          continue;
        }

        this.visibleChunks.push(chunk);
        // this.buildChunk(chunk);
        const len = chunk.tiles.length / 3;
        for (let i = 0; i < len; i++) {
          const index = i * 3;
          const x = chunk.tiles[index + 0] + (chunkX * 32);
          const y = chunk.tiles[index + 1] + (chunkY * 32);
          const spriteIndex = chunk.tiles[index + 2];
          this.pushTile(x, y, spriteIndex);
        }
      }
    }
  }

  tiles: unknown[] = [];

  public pushTile(x: number, y: number, v: number): void {
    const { tilesRect } = this.sceneViewport;
    const startX = tilesRect.x1;
    const startY = tilesRect.y1;
    this.tiles.push({
      x: x * 32,
      y: y * 32,
      z: this.currentTerrainLevel,
      v,
    });
  }

  public processTile(x: number, y: number) {
    const {
      activeLayer: { typedArray: view },
      availableCellsPerRowCount: row,
    } = this;

    const vs = view[(y + 0) * row + (x + 0)];
    if (vs === 0) {
      const vw = view[(y - 1) * row + (x + 0)] === 0 ? 0b1000 : 0;
      const vx = view[(y + 1) * row + (x + 0)] === 0 ? 0b0100 : 0;
      const va = view[(y + 0) * row + (x - 1)] === 0 ? 0b0010 : 0;
      const vd = view[(y + 0) * row + (x + 1)] === 0 ? 0b0001 : 0;
      const vq = view[(y - 1) * row + (x - 1)] === 0 ? 0 : 1;
      const ve = view[(y - 1) * row + (x + 1)] === 0 ? 0 : 1;
      const vz = view[(y + 1) * row + (x - 1)] === 0 ? 0 : 1;
      const vc = view[(y + 1) * row + (x + 1)] === 0 ? 0 : 1;

      if (vw && va && vq) {
        this.pushTile(x, y, ter["CC"]);
      }
      if (vw && vd && ve) {
        this.pushTile(x, y, ter["CZ"]);
      }
      if (vx && va && vz) {
        this.pushTile(x, y, ter["CE"]);
      }
      if (vx && vd && vc) {
        this.pushTile(x, y, ter["CQ"]);
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
          this.pushTile(x, y, shadow[v]);
          break;
        }
        case 0b1100: {
          this.pushTile(x, y, ter["EA"]);
          this.pushTile(x, y, ter["ED"]);
          break;
        }
        case 0b0011: {
          this.pushTile(x, y, ter["EW"]);
          this.pushTile(x, y, ter["ES"]);
          break;
        }
        case 0b1111:
          break;
      }

      //   this.pushTile(x, y, ter['FS']);
    } else {
      this.pushTile(x, y, vs);
    }
  }

  public processLayer(): void {
    const p = this.activeLayer.paintRect;
    const y1 = Math.max(p.y1 - 1, 1);
    const y2 = Math.min(p.y2 + 1, this.availableRowsPerLayerCount - 1);
    const x1 = Math.max(p.x1 - 1, 1);
    const x2 = Math.min(p.x2 + 1, this.availableCellsPerRowCount - 1);

    // for (let y = 1; y < this.availableRowsPerLayerCount - 1; y++) {
    //   for (let x = 1; x < this.availableCellsPerRowCount - 1; x++) {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const cellIndex = y * this.availableCellsPerRowCount + x;
        if (this.depthLayer[cellIndex] <= this.currentTerrainLevel) {
          //   this.processTile(x, y);
        }
      }
    }
  }

  public clear() {
    this.depthLayer.fill(EMPTY_CELL_VALUE);
    this.visibleTiles = 0;
    this.visibleChunks.splice(0);
    this.tiles.splice(0);
    this.paintedLayerCount = 0;
  }

  public build() {
    this.performance.start();
    this.clear();
    this.sceneViewport.update();

    const { level } = this.sceneViewport;
    const currentMaxLayerIndex = Math.min(this.availableLayerCount - 1, level);
    for (let layerIndex = 0; layerIndex <= currentMaxLayerIndex; layerIndex++) {
      this.currentLayerIndex = layerIndex;
      this.currentTerrainLevel = level - layerIndex;
      this.activeLayer = this.terrainLayers[layerIndex];
      this.buildLayer();
      this.paintedLayerCount++;
      if (this.paintedDepthCellCount === this.sceneViewport.grid.printable.cellCount) {
        break;
      }
    }

    // for (let layerIndex = this.paintedLayerCount - 1; layerIndex >= 0; layerIndex--) {
    //   this.currentLayerIndex = layerIndex;
    //   this.currentTerrainLevel = level - layerIndex;
    //   this.activeLayer = this.terrainLayers[layerIndex];
    //   this.processLayer();
    // }

    let index = 0;
    const view = this.tilesBuffer.typedArray;
    this.tiles.sort(sortTiles);
    for (const tile of this.tiles as any) {
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
      10,
      await resolver.resolve(spaceManagerService),
      await resolver.resolve(sceneViewportService),
      await resolver.resolve(viewportService),
      await resolver.resolve(tilesBufferService),
    );
  },
});
