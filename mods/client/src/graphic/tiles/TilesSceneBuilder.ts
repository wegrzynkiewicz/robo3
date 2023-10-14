import { PerformanceCounter } from "../../../../common/PerformanceCounter.ts";
import { ChunkId } from "../../../../core/chunk/chunkId.ts";
import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { SCREEN_MAX_VISIBLE_TILE_Y, SCREEN_MAX_VISIBLE_TILE_X } from "../../../../core/vars.ts";
import { Chunk, ChunkManager, chunkManagerService } from "../../../../domain-client/chunk/chunkManager.ts";
import { Point } from "../../../../math/Point.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { Viewport, viewportService } from "../Viewport.ts";
import { tilesBufferService } from "./tilesBuffer.ts";

export class TilesSceneBuilder {
  public visibleTiles = 0;
  public readonly visibleChunks: Chunk[] = [];
  public readonly depthMap: Uint8Array;
  public readonly performance = new PerformanceCounter('scene-builder', 60);
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
    this.totalCellCountPerLayer = (SCREEN_MAX_VISIBLE_TILE_Y) * (SCREEN_MAX_VISIBLE_TILE_X);
    this.depthMap = new Uint8Array(this.totalCellCountPerLayer);

    this.layers = [
      new Uint8Array(this.totalCellCountPerLayer),
      new Uint8Array(this.totalCellCountPerLayer),
      new Uint8Array(this.totalCellCountPerLayer),
    ];
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

  public buildChunk(z: number, chunk: Chunk) {
    const { tilesRect } = this.viewport;
    const { chunkId, segment } = chunk;
    const layer = this.layers[z];
    const view = segment!.grid.view;
    const chunkTileX = chunkId.x * 32;
    const chunkTileY = chunkId.y * 32;

    const srcX1 = Math.max(tilesRect.x1 - chunkTileX, 0)
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
            this.depthMap[dstIndex] = z + 1;
          }
          layer[dstIndex] = goTypeId;
        }
        dstX++;
      }
      dstY++;
    }
  }

  public buildLayer(z: number) {
    const { chunkRect, layer, spaceId } = this.viewport;
    const buffer = this.layers[z];
    buffer.fill(0);

    for (let chunkY = chunkRect.y1; chunkY <= chunkRect.y2; chunkY++) {
      for (let chunkX = chunkRect.x1; chunkX <= chunkRect.x2; chunkX++) {
        const chunkId = new ChunkId(spaceId, chunkX, chunkY, layer - z);
        const chunk = this.chunkManager.chunks.get(chunkId.toHex());
        if (chunk === undefined || chunk.segment === undefined) {
          continue;
        }
        this.buildChunk(z, chunk);
      }
    }
  }

  index = 0;

  public processLayer(z: number) {

    const view = this.tilesBuffer.typedArray;
    const { tilesRect } = this.viewport;
    const startX = tilesRect.x1;
    const startY = tilesRect.y1;
    const layer = this.layers[z];

    for (let y = 0; y < this.layerSize.y; y++) {
      for (let x = 0; x < this.layerSize.x; x++) {
        const spaceTilePosX = (startX + x) * 32;
        const spaceTilePosY = (startY + y) * 32;
        const index = y * this.layerSize.x + x;
        const value = layer[index];
        if (value === 0) {
          continue;
        }
        view[this.index++] = spaceTilePosX;
        view[this.index++] = spaceTilePosY;
        view[this.index++] = 32.0;
        view[this.index++] = 32.0;
        view[this.index++] = index2coords(value)[0] * 32.0;
        view[this.index++] = index2coords(value)[1] * 32.0;
        view[this.index++] = 0;
        view[this.index++] = 0;
        this.visibleTiles++;
      }
    }

  }

  public build() {
    const { tilesRect } = this.viewport;
    this.performance.start();
    const { layer, spaceRect } = this.viewport;
    this.visibleTiles = 0;
    this.visibleChunks.splice(0);
    this.depthMap.fill(0);

    const tilesCountY = Math.max(tilesRect.y2, 0) - Math.max(tilesRect.y1, 0);
    const tilesCountX = Math.max(tilesRect.x2, 0) - Math.max(tilesRect.x1, 0);
    const overflow = (this.totalCellCountPerLayer - tilesCountY * tilesCountX);
    this.currentCellCountPerLayer = this.totalCellCountPerLayer - overflow;

    this.paintedLayerCount = 0;
    this.paintedDepthCellCount = 0;
    const end = Math.min(2, layer);
    for (let z = 0; z <= end; z++) {
      this.buildLayer(z);
      this.paintedLayerCount++;
      if (this.paintedDepthCellCount === this.currentCellCountPerLayer) {
        break;
      }
    }

    this.index = 0;
    for (let z = this.paintedLayerCount; z > 0; z--) {
      this.processLayer(z - 1);
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
