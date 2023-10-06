import { assertNonNull } from "../../../common/asserts.ts";
import { formatBytes } from "../../../common/useful.ts";
import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { ChunkManager, chunkManagerService } from "../../../domain-client/chunk/chunkManager.ts";
import { Display, displayService } from "../graphic/Display.ts";
import { DynamicDrawBuffer } from "../graphic/DynamicDrawBuffer.ts";
import { Viewport, viewportService } from "../graphic/Viewport.ts";
import { TilesSceneBuilder, tilesSceneBuilderService } from "../graphic/tiles/TilesSceneBuilder.ts";
import { tilesBufferService } from "../graphic/tiles/tilesBuffer.ts";

export class DebugInfo {
  public readonly element: HTMLElement;
  public isEnabled = false;

  public constructor(
    public readonly display: Display,
    public readonly viewport: Viewport,
    public readonly tilesSceneBuilder: TilesSceneBuilder,
    public readonly tilesBuffer: DynamicDrawBuffer,
    public readonly chunkManager: ChunkManager,
  ) {
    const element = document.getElementById("debug-info");
    assertNonNull(element);
    this.element = element;
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
    this.element.innerText = "";
  }

  public toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  public update(fps: number) {
    if (this.isEnabled === false) {
      return;
    }
    const out = [];
    const { client } = this.display;
    out.push(`Display`);
    out.push(`  FPS: ${fps.toFixed(2)}`);
    out.push(`  Size: ${client.x} ${client.y}`);
    out.push(`  Scale: ${this.display.getScale()}`);

    const { size, centerChunk, centerPoint, depth, spaceId, spaceRect: sr } = this.viewport;
    out.push(`Viewport`);
    out.push(`  Axis: ${size.x / 32} ${size.y / 32}`);
    out.push(`  CenterChunk: ${centerChunk.x} ${centerChunk.y}`);
    out.push(`  CenterPoint: ${centerPoint.x} ${centerPoint.y}`);
    out.push(`  Depth: ${depth}`);
    out.push(`  Size: ${size.x} ${size.y}`);
    out.push(`  SpaceId: ${spaceId}`);
    out.push(`  SpaceRect: ${sr.x1} ${sr.y1} ${sr.x2} ${sr.y2}`);

    out.push(`Scene`);
    out.push(`  VisibleTiles: ${this.tilesSceneBuilder.visibleTiles}`);
    const bs = this.tilesBuffer.bytesSent;
    out.push(`  BytesSent: ${bs} (${formatBytes(bs)})`);

    out.push(`Chunks`);
    out.push(`  Loaded: ${this.chunkManager.chunks.size}`);
    if (this.tilesSceneBuilder.visibleChunks.length > 0) {
      out.push(`  Visible`);
      for (const chunk of this.tilesSceneBuilder.visibleChunks) {
        const { chunkId, chunkId: { x, y, z }, worldSpaceRect: r } = chunk;
        out.push(`    Id: ${chunkId.toHex()}`);
        out.push(`      Position: ${x} ${y} ${z}`);
        out.push(`      SpaceRect: ${r.x1} ${r.y1} ${r.x2} ${r.y2}`);
      }
    }

    this.element.textContent = out.join("\n");
  }
}

export const debugInfoService = registerService({
  async provider(resolver: ServiceResolver): Promise<DebugInfo> {
    return new DebugInfo(
      await resolver.resolve(displayService),
      await resolver.resolve(viewportService),
      await resolver.resolve(tilesSceneBuilderService),
      await resolver.resolve(tilesBufferService),
      await resolver.resolve(chunkManagerService),
    );
  },
});
