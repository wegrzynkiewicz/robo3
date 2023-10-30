import { createPerformanceCounter } from "../../../../common/PerformanceCounter.ts";
import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { SpaceManager, spaceManagerService } from "../../../../core/space/SpaceManager.ts";
import { Chunk } from "../../../../domain-client/chunk/chunkManager.ts";
import { SceneViewport, sceneViewportService } from "./SceneViewport.ts";
import { TilesCollector, tilesCollectorService } from "./TilesCollector.ts";

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

export class TilesSceneBuilder {
  public processedTile = 0;
  public readonly depthLayer: Uint16Array;
  public readonly tilesLayer: Uint16Array;
  public readonly performance = createPerformanceCounter("scene-builder", 60);
  public readonly visibleChunks: Chunk[] = [];
  protected readonly cells: number;
  protected readonly rows: number;

  public constructor(
    public readonly availableLayerCount: number,
    public readonly spaceManager: SpaceManager,
    public readonly sceneViewport: SceneViewport,
    public readonly tiles: TilesCollector,
  ) {
    const { cellCount, size } = this.sceneViewport.grid.available;
    this.depthLayer = new Uint16Array(cellCount);
    this.tilesLayer = new Uint16Array(cellCount);
    this.rows = size.y;
    this.cells = size.x;
  }

  protected calcIndex(x: number, y: number): number {
    return y * this.rows + x;
  }

  public buildChunk(chunkX: number, chunkY: number, chunkZ: number) {
    const { tilesRect, spaceId } = this.sceneViewport;
    const space = this.spaceManager.byId.get(spaceId);
    if (space === undefined) {
      return;
    }
    const chunk = space.chunkManager.getByCoords(chunkX, chunkY, chunkZ);
    if (chunk === undefined || chunk.segment === undefined) {
      return;
    }
    this.visibleChunks.push(chunk);
    const chunkTileX = chunkX * 32;
    const chunkTileY = chunkY * 32;
    const source = chunk.segment.grid.view;
    const srcX1 = Math.max(tilesRect.x1 - chunkTileX, 0);
    const srcY1 = Math.max(tilesRect.y1 - chunkTileY, 0);
    const srcX2 = Math.min(tilesRect.x2 - chunkTileX, 32);
    const srcY2 = Math.min(tilesRect.y2 - chunkTileY, 32);
    const dstX1 = Math.max(chunkTileX - tilesRect.x1, 0);
    const dstY1 = Math.max(chunkTileY - tilesRect.y1, 0);

    let dstY = dstY1;
    for (let srcY = srcY1; srcY < srcY2; srcY++) {
      let dstX = dstX1;
      for (let srcX = srcX1; srcX < srcX2; srcX++) {
        const dstIndex = dstY * this.cells + dstX;
        const srcIndex = srcY * 32 + srcX;
        const goTypeId = source[srcIndex];
        if (goTypeId !== 0) {
          this.depthLayer[dstIndex] = chunkZ;
          this.tilesLayer[dstIndex] = goTypeId;
        }
        dstX++;
      }
      dstY++;
    }
  }

  public buildLayer(terrainLevel: number) {
    const chunkRect = this.sceneViewport.chunkRect;
    for (let chunkY = chunkRect.y1; chunkY <= chunkRect.y2; chunkY++) {
      for (let chunkX = chunkRect.x1; chunkX <= chunkRect.x2; chunkX++) {
        this.buildChunk(chunkX, chunkY, terrainLevel);
      }
    }
  }

  protected processTile(x: number, y: number): void {
    const {
      cells: row,
    } = this;

    const ds = this.depthLayer[(y + 0) * row + (x + 0)];
    const vs = this.tilesLayer[(y + 0) * row + (x + 0)];
    if (vs === 0) {
      return;
    }
    this.tiles.put(x, y, ds, vs);

    this.processShadow(x, y, ds);
    this.processedTile++;
  }

  protected processShadow(x: number, y: number, z: number): void {
    const {
      cells: row,
    } = this;
    const view = this.depthLayer;

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
      this.tiles.put(x, y, z, ter["CC"]);
    }
    if (pw === 0 && pd === 0 && pe) {
      this.tiles.put(x, y, z, ter["CZ"]);
    }
    if (px === 0 && pa === 0 && pz) {
      this.tiles.put(x, y, z, ter["CE"]);
    }
    if (px === 0 && pd === 0 && pc) {
      this.tiles.put(x, y, z, ter["CQ"]);
    }

    const p = pw | px | pa | pd;

    // deno-fmt-ignore
    switch (p) {
      case 0b0001: { this.tiles.put(x, y, z, ter["EA"]); break; }
      case 0b0010: { this.tiles.put(x, y, z, ter["ED"]); break; }
      case 0b0011: { this.tiles.put(x, y, z, ter['EA']); this.tiles.put(x, y, z, ter['ED']); break; }
      case 0b0100: { this.tiles.put(x, y, z, ter["EW"]); break; }
      case 0b0101: { this.tiles.put(x, y, z, ter["LQ"]); break; }
      case 0b0110: { this.tiles.put(x, y, z, ter["LE"]); break; }
      case 0b0111: { this.tiles.put(x, y, z, ter["UW"]); break; }
      case 0b1000: { this.tiles.put(x, y, z, ter["ES"]); break; }
      case 0b1001: { this.tiles.put(x, y, z, ter["LZ"]); break; }
      case 0b1010: { this.tiles.put(x, y, z, ter["LC"]); break; }
      case 0b1011: { this.tiles.put(x, y, z, ter["UX"]); break; }
      case 0b1100: { this.tiles.put(x, y, z, ter['ES']); this.tiles.put(x, y, z, ter['EW']); break; }
      case 0b1101: { this.tiles.put(x, y, z, ter["UA"]); break; }
      case 0b1110: { this.tiles.put(x, y, z, ter["UD"]); break; }
      case 0b1111: { this.tiles.put(x, y, z, ter["HS"]); break; }
    }
    if (vs < this.sceneViewport.level) {
      for (let i = 0; i < this.sceneViewport.level - vs; i++) {
        this.tiles.put(x, y, z, ter["FS"]);
      }
    }
  }

  public processLayer(): void {
    for (let y = 1; y < this.rows - 1; y++) {
      for (let x = 1; x < this.cells - 1; x++) {
        this.processTile(x, y);
      }
    }
  }

  public clear() {
    this.processedTile = 0;
    this.visibleChunks.length = 0;
    this.tilesLayer.fill(0);
    this.depthLayer.fill(0);
    this.tiles.clear();
  }

  public build() {
    this.performance.start();
    this.clear();

    const { level } = this.sceneViewport;
    const currentMaxLayerIndex = Math.min(this.availableLayerCount - 1, level);
    for (let layerIndex = currentMaxLayerIndex; layerIndex >= 0; layerIndex--) {
      const currentTerrainLevel = level - layerIndex;
      this.buildLayer(currentTerrainLevel);
    }
    this.processLayer();
    this.tiles.flush();
    this.performance.end();
  }
}

export const tilesSceneBuilderService = registerService({
  async provider(resolver: ServiceResolver): Promise<TilesSceneBuilder> {
    return new TilesSceneBuilder(
      6,
      await resolver.resolve(spaceManagerService),
      await resolver.resolve(sceneViewportService),
      await resolver.resolve(tilesCollectorService),
    );
  },
});
