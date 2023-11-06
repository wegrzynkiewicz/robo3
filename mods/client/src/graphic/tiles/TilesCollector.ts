import { registerService,ServiceResolver } from "../../../../dependency/service.ts";
import { index2coords } from "../../../../core/numbers.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { SceneViewport,sceneViewportService } from "./SceneViewport.ts";
import { tilesBufferService } from "./tilesBuffer.ts";

export class TilesCollector {

  protected index = 0;
  protected tiles = [];
  public visibleTiles = 0;

  public constructor(
    public readonly sceneViewport: SceneViewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) { }

  public clear(): void {
    this.index = 0;
    this.visibleTiles = 0;
    this.tiles.length = 0;
  }

  public put(x: number, y: number, z: number, tileIndex: number): void {
    const view = this.tilesBuffer.typedArray;
    view[this.index++] = (this.sceneViewport.tilesRect.x1 + x) * 32;
    view[this.index++] = (this.sceneViewport.tilesRect.y1 + y) * 32;
    view[this.index++] = 32.0;
    view[this.index++] = 32.0;
    view[this.index++] = index2coords(tileIndex)[0] * 32.0;
    view[this.index++] = index2coords(tileIndex)[1] * 32.0;
    view[this.index++] = 0;
    view[this.index++] = z;
    this.visibleTiles++;
  }

  public flush() {
    this.tilesBuffer.update(this.visibleTiles * 32);
  }
}

export const tilesCollectorService = registerService({
  async provider(resolver: ServiceResolver): Promise<TilesCollector> {
    return new TilesCollector(
      await resolver.resolve(sceneViewportService),
      await resolver.resolve(tilesBufferService),
    );
  },
});
