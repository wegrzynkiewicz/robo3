import { createPerformanceCounter } from "../../../../common/PerformanceCounter.ts";
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

export class TilesSceneBuilder {
  public visibleTiles = 0;
  protected activeLayer: SceneTerrainLayer;
  protected activeChunk!: Chunk;
  public readonly visibleChunks: Chunk[] = [];
  public readonly performance = createPerformanceCounter("scene-builder", 60);
  protected paintedLayerCount = 0;
  protected paintedDepthCellCount = 0;
  depthLayer: Uint16Array;
  terrainLayers: SceneTerrainLayer[] = [];
  availableCellsPerRowCount: number;
  currentTerrainLevel = 0;
  availableRowsPerLayerCount: number;
  currentLayerIndex = 0;
  tileX = 0;
  tileY = 0;

  public constructor(
    public readonly availableLayerCount: number,
    public readonly spaceManager: SpaceManager,
    public readonly sceneViewport: SceneViewport,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {
    const { cellCount } = this.sceneViewport.grid.available;
    const totalByteLength = cellCount * (availableLayerCount + DEPTH_LAYERS_COUNT) * TERRAIN_CELL_BYTE_LENGTH
    const buffer = new ArrayBuffer(totalByteLength);
    this.depthLayer = new Uint16Array(buffer, 0, cellCount);
    for (let layerIndex = 0; layerIndex < availableLayerCount; layerIndex++) {
      const byteOffset = cellCount * (layerIndex + 1) * TERRAIN_CELL_BYTE_LENGTH
      const layerTypedArray = new Uint16Array(buffer, byteOffset, cellCount);
      const layer = new SceneTerrainLayer(layerTypedArray);
      this.terrainLayers.push(layer);
    }
    this.activeLayer = this.terrainLayers[0];
    this.availableRowsPerLayerCount = this.sceneViewport.grid.available.size.y;
    this.availableCellsPerRowCount = this.sceneViewport.grid.available.size.x;
  }

  public buildChunk() {
    const chunkTileX = this.activeChunk.chunkId.x * 32;
    const chunkTileY = this.activeChunk.chunkId.y * 32;

    const tilesRect = this.sceneViewport.tilesRect;
    const srcX1 = Math.max(tilesRect.x1 - chunkTileX, 0);
    const srcY1 = Math.max(tilesRect.y1 - chunkTileY, 0);
    const srcX2 = Math.min(tilesRect.x2 - chunkTileX, 32);
    const srcY2 = Math.min(tilesRect.y2 - chunkTileY, 32);
    const dstX1 = Math.max(chunkTileX - tilesRect.x1, 0);
    const dstY1 = Math.max(chunkTileY - tilesRect.y1, 0);

    this.visibleChunks.push(this.activeChunk);

    let dstY = dstY1;
    for (let srcY = srcY1; srcY < srcY2; srcY++) {
      let dstX = dstX1;
      for (let srcX = srcX1; srcX < srcX2; srcX++) {
        dstX++;
        this.buildTile(srcX, srcY, dstX, dstY);
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
        if (chunk === undefined || chunk.segment === undefined) {
          continue;
        }
        this.activeChunk = chunk;
        this.buildChunk();
      }
    }
  }

  public buildTile(srcX: number, srcY: number, dstX: number, dstY: number) {
    const dstIndex = dstY * this.availableCellsPerRowCount + dstX;
    if (this.depthLayer[dstIndex] === EMPTY_CELL_VALUE) {
      const srcIndex = srcY * 32 + srcX;
      const goTypeId = this.activeChunk.segment!.grid.view[srcIndex];
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
  }

  protected processTile(x: number, y: number): void {
    const {
      activeLayer: { typedArray: view },
      availableCellsPerRowCount: row,
    } = this;
    this.tileY = y;
    this.tileX = x;
    const vq = view[(y - 1) * row + (x - 1)];
    const vw = view[(y - 1) * row + (x + 0)];
    const ve = view[(y - 1) * row + (x + 1)];
    const va = view[(y + 0) * row + (x - 1)];
    const vs = view[(y + 0) * row + (x + 0)];
    const vd = view[(y + 0) * row + (x + 1)];
    const vz = view[(y + 1) * row + (x - 1)];
    const vx = view[(y + 1) * row + (x + 0)];
    const vc = view[(y + 1) * row + (x + 1)];
    if (vs === 0) {
      this.processShadow(vq, vw, ve, va, vs, vd, vz, vx, vc);
    } else {
      this.processTerrain(vq, vw, ve, va, vs, vd, vz, vx, vc);
    }
  }

  protected processShadow(
    vq: number,
    vw: number,
    ve: number,
    va: number,
    _s: number,
    vd: number,
    vz: number,
    vx: number,
    vc: number,
  ): void {
    const pw = vw === 0 ? 0 : 0b1000;
    const px = vx === 0 ? 0 : 0b0100;
    const pa = va === 0 ? 0 : 0b0010;
    const pd = vd === 0 ? 0 : 0b0001;
    const pq = vq === 0 ? 0 : 1;
    const pe = ve === 0 ? 0 : 1;
    const pz = vz === 0 ? 0 : 1;
    const pc = vc === 0 ? 0 : 1;

    if (pw === 0 && pa === 0 && pq) {
      this.put(ter["CC"]);
    }
    if (pw === 0 && pd === 0 && pe) {
      this.put(ter["CZ"]);
    }
    if (px === 0 && pa === 0 && pz) {
      this.put(ter["CE"]);
    }
    if (px === 0 && pd === 0 && pc) {
      this.put(ter["CQ"]);
    }

    const p = pw | px | pa | pd;

    // deno-fmt-ignore
    switch (p) {
      case 0b0001: { this.put(ter["EA"]); break; }
      case 0b0010: { this.put(ter["ED"]); break; }
      case 0b0011: { this.put(ter['EA']); this.put(ter['ED']); break; }
      case 0b0100: { this.put(ter["EW"]); break; }
      case 0b0101: { this.put(ter["LQ"]); break; }
      case 0b0110: { this.put(ter["LE"]); break; }
      case 0b0111: { this.put(ter["UW"]); break; }
      case 0b1000: { this.put(ter["ES"]); break; }
      case 0b1001: { this.put(ter["LZ"]); break; }
      case 0b1010: { this.put(ter["LC"]); break; }
      case 0b1011: { this.put(ter["UX"]); break; }
      case 0b1100: { this.put(ter['ES']); this.put(ter['EW']); break; }
      case 0b1101: { this.put(ter["UA"]); break; }
      case 0b1110: { this.put(ter["UD"]); break; }
      case 0b1111: { this.put(ter["HS"]); break; }
    }
  }

  protected processTerrain(
    _vq: number,
    _vw: number,
    _ve: number,
    _va: number,
    vs: number,
    _vd: number,
    _vz: number,
    _vx: number,
    _vc: number,
  ): void {
    this.put(vs);
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
          this.processTile(x, y);
        }
      }
    }
  }

  public index = 0;

  protected put(tileIndex: number): void {
    const view = this.tilesBuffer.typedArray;
    const { tilesRect } = this.sceneViewport;
    const startX = tilesRect.x1;
    const startY = tilesRect.y1;

    view[this.index++] = (startX + this.tileX) * 32;
    view[this.index++] = (startY + this.tileY) * 32;
    view[this.index++] = 32.0;
    view[this.index++] = 32.0;
    view[this.index++] = index2coords(tileIndex)[0] * 32.0;
    view[this.index++] = index2coords(tileIndex)[1] * 32.0;
    view[this.index++] = 0;
    view[this.index++] = 0;
    this.visibleTiles++;
  }

  public clear() {
    this.index = 0;
    this.depthLayer.fill(EMPTY_CELL_VALUE);
    this.visibleTiles = 0;
    this.visibleChunks.length = 0;
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

    for (let layerIndex = this.paintedLayerCount - 1; layerIndex >= 0; layerIndex--) {
      this.currentLayerIndex = layerIndex;
      this.currentTerrainLevel = level - layerIndex;
      this.activeLayer = this.terrainLayers[layerIndex];
      this.processLayer();
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
