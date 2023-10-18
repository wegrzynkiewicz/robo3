import { PerformanceCounter } from "../../../../common/PerformanceCounter.ts";
import { ChunkId } from "../../../../core/chunk/chunkId.ts";
import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { Chunk, ChunkManager, chunkManagerService } from "../../../../domain-client/chunk/chunkManager.ts";
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

const DEPTH_LAYERS_COUNT = 1;
const TERRAIN_CELL_BYTE_LENGTH = 2;

export class SceneLayerManager {
  protected currentLayerIndex = 0;
  protected currentTerrainLevel = 0;
  protected paintedLayerCount = 0;
  protected readonly terrainLayers: SceneTerrainLayer[] = [];
  public readonly depthLayer: SceneDepthLayer;

  public constructor(
    protected readonly availableLayerCount: number,
    public readonly chunkManager: ChunkManager,
    public readonly sceneViewport: SceneViewport,
  ) {
    const cellCount = this.sceneViewport.grid.available.cellCount;
    const totalByteLength = this.calcLayerByteLength(availableLayerCount + DEPTH_LAYERS_COUNT);
    const buffer = new ArrayBuffer(totalByteLength);
    const depthLayerView = new Uint16Array(buffer, 0, cellCount);
    const depthLayer = new SceneDepthLayer(depthLayerView);
    for (let layerIndex = 0; layerIndex < availableLayerCount; layerIndex++) {
      const byteOffset = this.calcLayerByteLength(layerIndex + 1);
      const layerTypedArray = new Uint16Array(buffer, byteOffset, cellCount);
      const layer = new SceneTerrainLayer(
        chunkManager,
        depthLayer,
        layerIndex,
        sceneViewport,
        layerTypedArray
      );
      this.terrainLayers.push(layer);
    }
    this.depthLayer = depthLayer;
  }

  public build(): void {
    this.clear();
    const level = this.sceneViewport.level;
    const currentMaxLevel = Math.min(this.availableLayerCount, level);
    for (let layerIndex = 0; layerIndex <= currentMaxLevel; layerIndex++) {
      const currentTerrainLevel = level - layerIndex;
      this.currentLayerIndex = layerIndex;
      const layer = this.terrainLayers[layerIndex];
      layer.build(currentTerrainLevel);
      this.paintedLayerCount++;
      if (this.depthLayer.paintedCellCount === this.sceneViewport.grid.printable.cellCount) {
        break;
      }
    }
  }

  protected calcLayerByteLength(layerIndex: number) {
    return this.sceneViewport.grid.available.cellCount * layerIndex * TERRAIN_CELL_BYTE_LENGTH;
  }

  public clear(): void {
    this.depthLayer.clear();
    this.paintedLayerCount = 0;
  }

  public process() {
    for (let layerIndex = this.paintedLayerCount - 1; layerIndex >= 0; layerIndex--) {
      const layer = this.terrainLayers[layerIndex];
      layer.process();
    }
  }
}

export class SceneDepthLayer {

  public static readonly EMPTY_CELL_VALUE = 0xFF;

  public paintedCellCount = 0;

  public constructor(
    protected readonly view: Uint16Array,
    protected readonly sceneViewport: SceneViewport,
  ) {

  }

  protected get availableCellsPerRow(): number {
    return this.sceneViewport.grid.available.size.x;
  }

  public canPaint(x: number, y: number, layerIndex: number): boolean {
    const cellIndex = y * this.availableCellsPerRow + x;
    const depth = this.view[cellIndex];
    return depth <= layerIndex;
  }

  public clear(): void {
    this.view.fill(SceneDepthLayer.EMPTY_CELL_VALUE);
    this.paintedCellCount = 0;
  }

  public isEmpty(x: number, y: number): boolean {
    const cellIndex = y * this.availableCellsPerRow + x;
    const empty = this.view[cellIndex] === SceneDepthLayer.EMPTY_CELL_VALUE;
    return empty;
  }

  public paint(x: number, y: number, layerIndex: number): void {
    const cellIndex = y * this.availableCellsPerRow + x;
    this.view[cellIndex] = layerIndex;
  }
}

export class SceneTerrainLayer {

  public constructor(
    public readonly layerIndex: number,
    public readonly sceneLayerManager: SceneLayerManager,
    public readonly typedArray: Uint16Array,
  ) {
  }

  public build(level: number) {
    this.clear();

    const { chunkManager, sceneViewport: { chunkRect, spaceId } } = this.sceneLayerManager;
    for (let chunkY = chunkRect.y1; chunkY <= chunkRect.y2; chunkY++) {
      for (let chunkX = chunkRect.x1; chunkX <= chunkRect.x2; chunkX++) {
        const chunkId = new ChunkId(spaceId, chunkX, chunkY, level);
        const chunk = chunkManager.chunks.get(chunkId.toHex());
        if (chunk === undefined || chunk.segment === undefined) {
          continue;
        }
        this.buildChunk(chunk);
      }
    }
  }

  public buildChunk(chunk: Chunk) {
    const {
      availableCellsPerRow,
      sceneLayerManager: {
        depthLayer,
        sceneViewport: { tilesRect },
      },
      typedArray,
    } = this;
    const { chunkId, segment } = chunk;

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
        const dstIndex = dstY * availableCellsPerRow + dstX;
        if (depthLayer.isEmpty(dstX, dstY)) {
          const srcIndex = y * 32 + x;
          const goTypeId = view[srcIndex];
          if (goTypeId !== 0) {
            depthLayer.paint(x, y, this.layerIndex);
          }
          typedArray[dstIndex] = goTypeId;
        }
        dstX++;
      }
      dstY++;
    }
  }

  protected get availableRows(): number {
    return this.sceneLayerManager.sceneViewport.grid.available.size.y;
  }

  protected get availableCellsPerRow(): number {
    return this.sceneLayerManager.sceneViewport.grid.available.size.x;
  }

  public clear(): void {
    this.typedArray.fill(0);
  }

  public process(): void {
    const {
      availableCellsPerRow,
      availableRows,
      sceneLayerManager: {
        depthLayer,
      },
      layerIndex,
    } = this;
    for (let y = 1; y < availableRows - 1; y++) {
      for (let x = 1; x < availableCellsPerRow - 1; x++) {
        if (depthLayer.canPaint(x, y, layerIndex)) {
          this.processTile(x, y);
        }
      }
    }
  }

  public processTile(x: number, y: number) {
    const z = this.layerIndex;

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
}

export class TilesSceneBuilder {
  public visibleTiles = 0;
  public readonly visibleChunks: Chunk[] = [];
  public readonly depthMap: Uint8Array;
  public readonly performance = new PerformanceCounter("scene-builder", 60);
  public readonly layers: Uint8Array[];
  protected paintedLayerCount = 0;
  protected paintedDepthCellCount = 0;
  sceneLayerManager: SceneLayerManager;
  this: any;

  public constructor(
    public readonly chunkManager: ChunkManager,
    public readonly sceneViewport: SceneViewport,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {
    this.sceneLayerManager = new SceneLayerManager(10, chunkManager, sceneViewport);
    const { cellCount } = this.sceneViewport.grid.available;
    this.depthMap = new Uint8Array(cellCount);

    this.layers = [
      new Uint8Array(cellCount),
      new Uint8Array(cellCount),
      new Uint8Array(cellCount),
      new Uint8Array(cellCount),
      new Uint8Array(cellCount),
      new Uint8Array(cellCount),
      new Uint8Array(cellCount),
      new Uint8Array(cellCount),
      new Uint8Array(cellCount),
      new Uint8Array(cellCount),
    ];

    this.activeLayer = this.layers[0];
    this.row = this.sceneViewport.grid.available.size.x;
  }

  public buildChunk(chunk: Chunk) {
    const { tilesRect } = this.sceneViewport;
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
        const dstIndex = dstY * this.row + dstX;
        if (this.depthMap[dstIndex] === 255) {
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
    const { chunkRect } = this.sceneViewport;
    const { spaceId } = this.viewport;
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
    const { level } = this.viewport;
    const startX = this.sceneViewport.tilesRect.x1;
    const startY = this.sceneViewport.tilesRect.y1;
    this.tiles.push({
      x: (startX + x) * 32,
      y: (startY + y) * 32,
      z: level - z,
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
    for (let y = 1; y < this.sceneViewport.grid.available.size.y - 1; y++) {
      for (let x = 1; x < this.row - 1; x++) {
        const index = y * this.row + x;
        const depth = this.depthMap[index];
        if (depth <= this.currentLayerIndex) {
          this.processTile(x, y);
        }
      }
    }
  }

  currentLayerIndex = 0;

  public build() {
    this.performance.start();
    const { level } = this.viewport;
    this.sceneViewport.update();
    this.visibleTiles = 0;
    this.visibleChunks.splice(0);
    this.tiles.splice(0);
    this.depthMap.fill(255);

    this.sceneLayerManager.build();

    this.paintedLayerCount = 0;
    this.paintedDepthCellCount = 0;

    const end = Math.min(9, level);
    for (let z = 0; z <= end; z++) {
      this.activeLayer = this.layers[z];
      this.currentLayerIndex = level - z;
      this.buildLayer();
      this.paintedLayerCount++;
      if (this.paintedDepthCellCount === this.sceneViewport.grid.printable.cellCount) {
        break;
      }
    }

    for (let z = this.paintedLayerCount - 1; z >= 0; z--) {
      this.currentLayerIndex = level - z;
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
      await resolver.resolve(sceneViewportService),
      await resolver.resolve(viewportService),
      await resolver.resolve(tilesBufferService),
    );
  },
});
