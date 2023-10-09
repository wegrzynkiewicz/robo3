import { ChunkId } from "../../../../core/chunk/chunkId.ts";
import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { SCREEN_MAX_VISIBLE_TILE_Y, SCREEN_MAX_VISIBLE_TILE_X } from "../../../../core/vars.ts";
import { Chunk, ChunkManager, chunkManagerService } from "../../../../domain-client/chunk/chunkManager.ts";
import { cornerRect, getIntersection, intersectsNonStrict } from "../../../../math/CornerRectangle.ts";
import { point } from "../../../../math/Point.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { Viewport, viewportService } from "../Viewport.ts";
import { tilesBufferService } from "./tilesBuffer.ts";

export class TilesSceneBuilder {
  public visibleTiles = 0;
  public readonly visibleChunks: Chunk[] = [];
  public readonly depthMap: Uint8Array;
  public constructor(
    public readonly chunkManager: ChunkManager,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {
    this.depthMap = new Uint8Array(
      (SCREEN_MAX_VISIBLE_TILE_Y) * (SCREEN_MAX_VISIBLE_TILE_X)
    );
  }

  public getChunks() {
    const { centerChunk: { x, y }, depth: z } = this.viewport;
    const spaceId = 1;
    const chunkIds = [
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
    // const chunks: Chunk[] = [];
    // for (const chunkId of chunkIds) {
    //   const chunk = this.chunkManager.chunks.get(chunkId.toHex());
    //   if (chunk) {
    //     chunks.push(chunk);
    //   }
    // }
    return chunkIds;
  }

  public build() {
    const view = this.tilesBuffer.typedArray;
    const { spaceRect } = this.viewport;
    this.visibleTiles = 0;
    this.visibleChunks.splice(0);
    let index = 0;
    (window as any).obj = [];

    const { centerChunk, depth: z } = this.viewport;

    const spaceId = 1;
    this.depthMap.fill(0);

    let offsetDestGridYAccumulator = 0;
    for (let chunkY = 0; chunkY < 3; chunkY++) {
      let offsetDestGridX = 0;
      const offsetDestGridY = offsetDestGridYAccumulator;
      for (let chunkX = 0; chunkX < 3; chunkX++) {
        const chunkId = new ChunkId(
          spaceId,
          centerChunk.x + chunkX - 1,
          centerChunk.y + chunkY - 1,
          z
        );
        const chunk = this.chunkManager.chunks.get(chunkId.toHex());
        if (chunk === undefined || chunk.segment === undefined) {
          continue;
        }
        if (intersectsNonStrict(chunk.worldSpaceRect, spaceRect)) {
          const intersection = getIntersection(chunk.worldSpaceRect, spaceRect);
          const source = cornerRect(
            Math.floor(intersection.x1 % 1024 / 32),
            Math.floor(intersection.y1 % 1024 / 32),
            Math.ceil((intersection.x2 % 1024 / 32) || 32),
            Math.ceil((intersection.y2 % 1024 / 32) || 32),
          );
          const tilesCount = point(
            source.x2 - source.x1 - 1,
            source.y2 - source.y1 - 1,
          );
          const destination = cornerRect(
            offsetDestGridX,
            offsetDestGridY,
            offsetDestGridX + tilesCount.x,
            offsetDestGridY + tilesCount.y,
          );

          offsetDestGridX += tilesCount.x;
          offsetDestGridYAccumulator = tilesCount.y;

          (window as any).obj.push({ chunk, source, tilesCount, destination });
          this.visibleChunks.push(chunk);

          let offsetDestY = destination.y1;
          for (let y = source.y1; y < source.y2; y++) {
            let offsetDestX = destination.x1;
            for (let x = source.x1; x < source.x2; x++) {
              const sourceIndex = y * 32 + x;
              const goTypeId = chunk.segment.grid.view[sourceIndex];
              goTypeId
              const destIndex = offsetDestY * SCREEN_MAX_VISIBLE_TILE_Y + offsetDestX;
              offsetDestX++;
              this.depthMap[destIndex] = goTypeId;
            }
            offsetDestY++;
          }      
        }
      }
    }
    let buffer = "";
    for (let y = 0; y < SCREEN_MAX_VISIBLE_TILE_Y; y++) {
      for (let x = 0; x < SCREEN_MAX_VISIBLE_TILE_X; x++) {
        const index = y * SCREEN_MAX_VISIBLE_TILE_Y + x;
        const value = this.depthMap[index];
        buffer += value.toString().padStart(2, '0');
        buffer += ' ';
      }
      buffer += `\n`;
    }
    (window as any).buffer = buffer;

    for (const chunkId of this.getChunks()) {
      const chunk = this.chunkManager.chunks.get(chunkId.toHex());
      if (chunk === undefined || chunk.segment === undefined) {
        continue;
      }
      if (intersectsNonStrict(chunk.worldSpaceRect, spaceRect)) {
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
