import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { Chunk, ChunkManager, chunkManagerService } from "../../../../domain-client/chunk/chunkManager.ts";
import { intersectsNonStrict } from "../../../../math/CornerRectangle.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { Viewport, viewportService } from "../Viewport.ts";
import { tilesBufferService } from "./tilesBuffer.ts";

export class TilesSceneBuilder {
  public visibleTiles = 0;
  public readonly visibleChunks: Chunk[] = [];
  public constructor(
    public readonly chunkManager: ChunkManager,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) { }

  public build() {
    const view = this.tilesBuffer.typedArray;
    const { spaceRect } = this.viewport;
    this.visibleTiles = 0;
    this.visibleChunks.splice(0);
    let index = 0;
    // TODO: query chunks by chunkId set, based on viewport center point
    for (const chunk of this.chunkManager.chunks.values()) {
      if (chunk.chunkId.z === this.viewport.depth) {
        if (intersectsNonStrict(chunk.worldSpaceBoundRect, spaceRect)) {
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
