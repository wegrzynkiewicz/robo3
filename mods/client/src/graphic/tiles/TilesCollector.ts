import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { SceneViewport, sceneViewportService } from "./SceneViewport.ts";
import { tilesBufferService } from "./tilesBuffer.ts";

export class TilesCollector {
  protected index = 0;
  protected tiles = [];
  public visibleTiles = 0;

  public constructor(
    public readonly sceneViewport: SceneViewport,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {}

  public clear(): void {
    this.index = 0;
    this.visibleTiles = 0;
    this.tiles.length = 0;
  }

  public put(x: number, y: number, z: number, tileIndex: number): void {
    const dv = this.tilesBuffer.dataView;
    const index = this.index++ * 8;
    dv.setInt16(index + 0, x * 32, true);
    dv.setInt16(index + 2, y * 32, true);
    dv.setInt32(index + 4, tileIndex, true);
    this.visibleTiles++;
  }

  public flush() {
    this.tilesBuffer.update(this.visibleTiles * 8);
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
