import { PerformanceCounter } from "../../../../common/PerformanceCounter.ts";
import { ChunkId } from "../../../../core/chunk/chunkId.ts";
import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { SCREEN_MAX_VISIBLE_TILE_Y, SCREEN_MAX_VISIBLE_TILE_X } from "../../../../core/vars.ts";
import { Chunk, ChunkManager, chunkManagerService } from "../../../../domain-client/chunk/chunkManager.ts";
import { intersectsNonStrict } from "../../../../math/CornerRectangle.ts";
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
  protected cellCountPerLayer = 0;
  protected paintedDepthCellCount = 0;
  protected layerSize: Point;
  public constructor(
    public readonly chunkManager: ChunkManager,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {
    this.layerSize = { x: SCREEN_MAX_VISIBLE_TILE_X, y: SCREEN_MAX_VISIBLE_TILE_Y };
    this.cellCountPerLayer = (SCREEN_MAX_VISIBLE_TILE_Y) * (SCREEN_MAX_VISIBLE_TILE_X);
    this.depthMap = new Uint8Array(this.cellCountPerLayer);

    this.layers = [
      new Uint8Array(this.cellCountPerLayer),
      new Uint8Array(this.cellCountPerLayer),
      new Uint8Array(this.cellCountPerLayer),
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

  public buildLayer(z: number) {
    const { chunkRect, layer, spaceId, tilesRect } = this.viewport;
    const buffer = this.layers[z];
    buffer.fill(0);

    const chunks: Record<number, Record<number, Chunk>> = {};
    for (let chunkY = chunkRect.y1; chunkY <= chunkRect.y2; chunkY++) {
      chunks[chunkY] = {};
      for (let chunkX = chunkRect.x1; chunkX <= chunkRect.x2; chunkX++) {
        const chunkId = new ChunkId(spaceId, chunkX, chunkY, layer - z);
        const chunk = this.chunkManager.chunks.get(chunkId.toHex());
        if (chunk === undefined || chunk.segment === undefined) {
          continue;
        }
        chunks[chunkY][chunkX] = chunk;
      }
    }

    let dstY = 0;
    for (let y = tilesRect.y1; y < tilesRect.y2; y++) {
      let dstX = 0;
      for (let x = tilesRect.x1; x < tilesRect.x2; x++) {
        const dstIndex = dstY * SCREEN_MAX_VISIBLE_TILE_X + dstX;
        if (this.depthMap[dstIndex] === 0) {
          const chunkX = Math.floor(x / 32);
          const chunkY = Math.floor(y / 32);
          const chunk = chunks?.[chunkY]?.[chunkX];
          if (chunk) {
            const tileX = x % 32;
            const tileY = y % 32;
            const srcIndex = tileY * 32 + tileX;
            const value = chunk.segment!.grid.view[srcIndex];
            if (value < 10) {
              this.depthMap[dstIndex] = z + 1;
              this.paintedDepthCellCount++;
            }
            buffer[dstIndex] = value;
          } else {
            this.depthMap[dstIndex] = 1;
            this.paintedDepthCellCount++;
          }
        }
        dstX++;
      }
      dstY++;
    }
  }

  public processLayer(z: number) {
    const { tilesRect } = this.viewport;
    let startX = tilesRect.x1;
    let startY = tilesRect.y1;
    const layer = this.layers[z];

    for (let y = 0; y < this.layerSize.y; y++) {
      for (let x = 0; x < this.layerSize.x; x++) {
        const index = y * this.layerSize.x + ;
        const value = layer;
      }
    }
  }

  public build() {
    this.performance.start();
    const view = this.tilesBuffer.typedArray;
    const { layer, spaceRect } = this.viewport;
    this.visibleTiles = 0;
    this.visibleChunks.splice(0);
    let index = 0;
    this.depthMap.fill(0);

    this.paintedLayerCount = 0;
    this.paintedDepthCellCount = 0;
    const end = Math.min(2, layer);
    for (let z = 0; z <= end; z++) {
      this.buildLayer(z);
      this.paintedLayerCount++;
      if (this.paintedDepthCellCount === this.cellCountPerLayer) {
        break;
      }
    }

    for (let z = this.paintedLayerCount; z > 0; z--) {
      this.processLayer(z);
    }

    this.performance.end();

    for (const chunk of this.getChunks()) {
      if (intersectsNonStrict(chunk.worldSpaceRect, spaceRect)) {
        this.visibleChunks.push(chunk);
        for (const go of chunk.gos) {
          if (intersectsNonStrict(go.worldSpaceRect, spaceRect)) {
            const { goTypeId, spacePosition } = go;
            view[index++] = spacePosition.x;
            view[index++] = spacePosition.y;
            view[index++] = 32.0;
            view[index++] = 32.0;
            view[index++] = index2coords(goTypeId)[0] * 32.0;
            view[index++] = index2coords(goTypeId)[1] * 32.0;
            view[index++] = 0;
            view[index++] = 0;
            this.visibleTiles++;

            if (goTypeId > 64 && goTypeId !== 75) {
              view[index++] = spacePosition.x;
              view[index++] = spacePosition.y;
              view[index++] = 32.0;
              view[index++] = 32.0;
              view[index++] = index2coords(75)[0] * 32.0;
              view[index++] = index2coords(75)[1] * 32.0;
              view[index++] = 0;
              view[index++] = 0;
              this.visibleTiles++;
            }
          }
        }
      }
    }
    this.tilesBuffer.update(this.visibleTiles * 32);
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
