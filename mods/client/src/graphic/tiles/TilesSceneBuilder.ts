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
const EMPTY_CELL_VALUE = 0x00;

export class SceneTerrainLayer {
  public paintRect = cornerRect(0, 0, 0, 0);
  public constructor(
    public readonly typedArray: Uint16Array,
  ) {
  }

  public clear(): void {
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
  view: Uint16Array;
  processedTile = 0;
  mainLayer: Uint16Array;

  public constructor(
    public readonly availableLayerCount: number,
    public readonly spaceManager: SpaceManager,
    public readonly sceneViewport: SceneViewport,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {
    const { cellCount } = this.sceneViewport.grid.available;
    const totalByteLength = cellCount * availableLayerCount * TERRAIN_CELL_BYTE_LENGTH
    this.depthLayer = new Uint16Array(cellCount);
    this.mainLayer = new Uint16Array(cellCount);
    const buffer = new ArrayBuffer(totalByteLength);
    this.view = new Uint16Array(buffer);
    for (let layerIndex = 0; layerIndex < availableLayerCount; layerIndex++) {
      const byteOffset = cellCount * layerIndex * TERRAIN_CELL_BYTE_LENGTH
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
    const view = this.mainLayer;
    const grid = this.activeChunk.segment!.grid.view;

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
        const dstIndex = dstY * this.availableCellsPerRowCount + dstX;
        const srcIndex = srcY * 32 + srcX;
        const goTypeId = grid[srcIndex];
        if (goTypeId !== 0) {
          this.depthLayer[dstIndex] = this.currentTerrainLevel;
          view[dstIndex] = goTypeId;
        }
        dstX++;
      }
      dstY++;
    }
  }

  public buildLayer() {
    const { chunkRect, spaceId } = this.sceneViewport;
    const space = this.spaceManager.obtain(spaceId);
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

  protected processTile(x: number, y: number): void {
    const {
      mainLayer,
      availableCellsPerRowCount: row,
    } = this;
    this.tileY = y;
    this.tileX = x;

    const vs = mainLayer[(y + 0) * row + (x + 0)];
    if (vs === 0) {
      return;
    }
    this.put(vs);

    this.processShadow();
    this.processedTile++;
  }

  protected processShadow(): void {
    const {
      availableCellsPerRowCount: row,
    } = this;
    const view = this.depthLayer;

    const y = this.tileY;
    const x = this.tileX;

    const vq = view[(y - 1) * row + (x - 1)];
    const vw = view[(y - 1) * row + (x + 0)];
    const ve = view[(y - 1) * row + (x + 1)];
    const va = view[(y + 0) * row + (x - 1)];
    const vs = view[(y + 0) * row + (x + 0)];
    const vd = view[(y + 0) * row + (x + 1)];
    const vz = view[(y + 1) * row + (x - 1)];
    const vx = view[(y + 1) * row + (x + 0)];
    const vc = view[(y + 1) * row + (x + 1)];

    const pw = vw <= vs ? 0 : 0b1000;
    const px = vx <= vs ? 0 : 0b0100;
    const pa = va <= vs ? 0 : 0b0010;
    const pd = vd <= vs ? 0 : 0b0001;
    const pq = vq <= vs ? 0 : 1;
    const pe = ve <= vs ? 0 : 1;
    const pz = vz <= vs ? 0 : 1;
    const pc = vc <= vs ? 0 : 1;

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
    if (vs < this.sceneViewport.level) {
      for (let i = 0; i < this.sceneViewport.level - vs; i++) {
        this.put(ter["FS"]);
      }
    }
  }

  public processMainLayer(): void {
    for (let y = 1; y < this.availableRowsPerLayerCount - 1; y++) {
      for (let x = 1; x < this.availableCellsPerRowCount - 1; x++) {
        this.processTile(x, y);
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
    this.visibleTiles = 0;
    this.paintedLayerCount = 0;
    this.processedTile = 0;
    this.visibleChunks.length = 0;
    this.depthLayer.fill(EMPTY_CELL_VALUE);
    this.view.fill(0);
    for (const layer of this.terrainLayers) {
      layer.clear();
    }
  }

  public build() {
    this.performance.start();
    this.clear();
    this.sceneViewport.update();
    this.mainLayer.fill(0);

    const { level } = this.sceneViewport;
    const currentMaxLayerIndex = Math.min(this.availableLayerCount - 1, level);
    for (let layerIndex = currentMaxLayerIndex; layerIndex >= 0; layerIndex--) {
      this.currentLayerIndex = layerIndex;
      this.currentTerrainLevel = level - layerIndex;
      this.activeLayer = this.terrainLayers[layerIndex];
      this.buildLayer();
    }

    for (let layerIndex = currentMaxLayerIndex; layerIndex >= 0; layerIndex--) {
      this.currentLayerIndex = layerIndex;
      this.currentTerrainLevel = level - layerIndex;
      this.activeLayer = this.terrainLayers[layerIndex];
      //   this.processLayer();
    }

    this.processMainLayer();

    this.tilesBuffer.update(this.visibleTiles * 32);
    this.performance.end();
  }
}

export const tilesSceneBuilderService = registerService({
  async provider(resolver: ServiceResolver): Promise<TilesSceneBuilder> {
    return new TilesSceneBuilder(
      6,
      await resolver.resolve(spaceManagerService),
      await resolver.resolve(sceneViewportService),
      await resolver.resolve(viewportService),
      await resolver.resolve(tilesBufferService),
    );
  },
});
