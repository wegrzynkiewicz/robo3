import { registerService,ServiceResolver } from "../../../../dependency/service.ts";
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
    const v1 = new Uint32Array(this.tilesBuffer.typedArray.buffer);
    view[this.index++] = (this.sceneViewport.tilesRect.x1 + x) * 32;
    view[this.index++] = (this.sceneViewport.tilesRect.y1 + y) * 32;
    view[this.index++] = 32.0;
    view[this.index++] = 32.0;
    const binding = (window as any).bindings[tileIndex]
    view[this.index++] = binding.texture.mapping.x;
    view[this.index++] = binding.texture.mapping.y;
    view[this.index++] = 0;
    v1[this.index++] = tileIndex;
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
