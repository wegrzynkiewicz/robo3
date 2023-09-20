import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { ChunkManager, chunkManagerService } from "../../../../domain-client/chunk/chunkManager.ts";
import { intersectsNonStrict } from "../../../../math/CornerRectangle.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { Viewport, viewportService } from "../Viewport.ts";
import { tilesBufferService } from "./tilesBuffer.ts";

export class TilesSceneBuilder {
  public visibleTiles = 0;
  public constructor(
    public readonly chunkManager: ChunkManager,
    public readonly viewport: Viewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {

  }

  public build() {
    const view = this.tilesBuffer.typedArray;
    const { worldSpaceRect } = this.viewport;
    this.visibleTiles = 0;
    let index = 0;
    for (const chunk of this.chunkManager.chunks.values()) { 
      // TODO: query chunks by chunkId set, based on viewport center point
      if (intersectsNonStrict(chunk.worldSpaceBoundRect, worldSpaceRect)) {
        for (const go of chunk.gos) {
          if (intersectsNonStrict(go.worldSpaceRect, worldSpaceRect)) {
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
    this.tilesBuffer.update(this.visibleTiles * 32);
  }
}

export const tilesSceneBuilderService = registerService({
  async provider(resolver: ServiceResolver): Promise<TilesSceneBuilder> {
    const [chunkManager, viewport, tilesBuffer] = await Promise.all([
      resolver.resolve(chunkManagerService),
      resolver.resolve(viewportService),
      resolver.resolve(tilesBufferService),
    ]);
    return new TilesSceneBuilder(chunkManager, viewport, tilesBuffer);
  },
});
