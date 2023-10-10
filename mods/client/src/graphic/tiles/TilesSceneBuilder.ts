import { PerformanceCounter } from "../../../../common/PerformanceCounter.ts";
import { ChunkId } from "../../../../core/chunk/chunkId.ts";
import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { SCREEN_MAX_VISIBLE_TILE_Y, SCREEN_MAX_VISIBLE_TILE_X } from "../../../../core/vars.ts";
import { Chunk, ChunkManager, chunkManagerService } from "../../../../domain-client/chunk/chunkManager.ts";
import { cornerRect, intersectsNonStrict } from "../../../../math/CornerRectangle.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { Viewport, viewportService } from "../Viewport.ts";
import { tilesBufferService } from "./tilesBuffer.ts";

export class TilesSceneBuilder {
  public visibleTiles = 0;
  public readonly visibleChunks: Chunk[] = [];
  public readonly depthMap: Uint8Array;
  public readonly performance = new PerformanceCounter('scene-builder', 60);
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  levels: Uint8Array[];
  public constructor(
    public readonly chunkManager: ChunkManager,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {
    this.depthMap = new Uint8Array(
      (SCREEN_MAX_VISIBLE_TILE_Y) * (SCREEN_MAX_VISIBLE_TILE_X)
    );

    this.levels = [
      new Uint8Array((SCREEN_MAX_VISIBLE_TILE_Y) * (SCREEN_MAX_VISIBLE_TILE_X)),
      new Uint8Array((SCREEN_MAX_VISIBLE_TILE_Y) * (SCREEN_MAX_VISIBLE_TILE_X)),
    ];

    this.canvas = document.createElement('canvas');
    this.canvas.width = SCREEN_MAX_VISIBLE_TILE_X;
    this.canvas.height = SCREEN_MAX_VISIBLE_TILE_Y;
    this.context = this.canvas.getContext('2d', { willReadFrequently: true })!;
    document.body.appendChild(this.canvas);
    this.canvas.style.width = `${SCREEN_MAX_VISIBLE_TILE_X * 8}px`;
    this.canvas.style.height = `${SCREEN_MAX_VISIBLE_TILE_Y * 8}px`;
    this.canvas.style.imageRendering = 'pixelated';
  }

  public getChunks() {
    const { centerChunk: { x, y }, depth: z } = this.viewport;
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

  public build() {
    this.performance.start();
    const view = this.tilesBuffer.typedArray;
    const { spaceRect, depth } = this.viewport;
    this.visibleTiles = 0;
    this.visibleChunks.splice(0);
    let index = 0;
    this.depthMap.fill(0);

    const tilesView = cornerRect(
      Math.floor(spaceRect.x1 / 32),
      Math.floor(spaceRect.y1 / 32),
      Math.floor(spaceRect.x2 / 32),
      Math.floor(spaceRect.y2 / 32),
    );
    const spaceId = 1;

    const chunksView = cornerRect(
      Math.max(0, Math.floor(spaceRect.x1 / 1024)),
      Math.max(0, Math.floor(spaceRect.y1 / 1024)),
      Math.max(0, Math.floor(spaceRect.x2 / 1024)),
      Math.max(0, Math.floor(spaceRect.y2 / 1024)),
    );

    const yLevel: Chunk[][] = [];
    for (let chunkY = chunksView.y1; chunkY <= chunksView.y2; chunkY++) {
      const xLevel: Chunk[] = [];
      for (let chunkX = chunksView.x1; chunkX <= chunksView.x2; chunkX++) {
        const chunkId = new ChunkId(spaceId, chunkX, chunkY, depth);
        const chunk = this.chunkManager.chunks.get(chunkId.toHex());
        if (chunk === undefined || chunk.segment === undefined) {
          continue;
        }
        xLevel.push(chunk);
      }
      yLevel.push(xLevel);
    }

    let dstZ = 0;
    for (let z = depth; z >= 0; z--) {
      if (dstZ > this.levels.length - 1) {
        continue;
      }
      let dstY = 0;
      for (let y = tilesView.y1; y < tilesView.y2; y++) {
        if (y < 0) {
          dstY++;
          continue;
        }
        let dstX = 0;
        for (let x = tilesView.x1; x < tilesView.x2; x++) {
          if (x < 0) {
            dstX++;
            continue;
          }
          const chunkX = Math.floor(x / 32) - chunksView.x1;
          const chunkY = Math.floor(y / 32) - chunksView.y1;
          const tileX = x % 32;
          const tileY = y % 32;
          const srcIndex = tileY * 32 + tileX;
          const dstIndex = dstY * SCREEN_MAX_VISIBLE_TILE_X + dstX;
          const chunk = yLevel?.[chunkY]?.[chunkX];
          if (chunk) {
            const value = chunk.segment!.grid.view[srcIndex];
            this.depthMap[dstIndex] = value > 8 ? 0xff : value;
            this.levels[dstZ][dstIndex] = value;
          }
          dstX++;
        }
        dstY++;
      }
      dstZ++;
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
