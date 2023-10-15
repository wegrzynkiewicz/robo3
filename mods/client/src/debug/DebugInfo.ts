import { assertNonNull } from "../../../common/asserts.ts";
import { formatBytes } from "../../../common/useful.ts";
import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { SCREEN_MAX_VISIBLE_TILE_Y, SCREEN_MAX_VISIBLE_TILE_X } from "../../../core/vars.ts";
import { ChunkManager, chunkManagerService } from "../../../domain-client/chunk/chunkManager.ts";
import { Display, displayService } from "../graphic/Display.ts";
import { DynamicDrawBuffer } from "../graphic/DynamicDrawBuffer.ts";
import { Viewport, viewportService } from "../graphic/Viewport.ts";
import { TilesSceneBuilder, tilesSceneBuilderService } from "../graphic/tiles/TilesSceneBuilder.ts";
import { tilesBufferService } from "../graphic/tiles/tilesBuffer.ts";
import { DebugBufferPreview } from "./DebugBufferPreview.ts";
import { DepthDebugBufferPreviewColorizer } from "./DepthDebugBufferPreviewColorizer.ts";
import { TerrainDebugBufferPreviewColorizer } from "./TerrainDebugBufferPreviewColorizer.ts";

export class DebugInfo {
  public readonly left: HTMLElement;
  public readonly right: HTMLElement;
  public isEnabled = false;
  public previews: DebugBufferPreview<any>[] = [];

  public constructor(
    public readonly display: Display,
    public readonly viewport: Viewport,
    public readonly tilesSceneBuilder: TilesSceneBuilder,
    public readonly tilesBuffer: DynamicDrawBuffer,
    public readonly chunkManager: ChunkManager,
  ) {
    const left = document.getElementById("debug-info-left");
    const right = document.getElementById("debug-info-right");
    assertNonNull(left);
    assertNonNull(right);
    this.left = left;
    this.right = right;

    const preview = new DebugBufferPreview(
      tilesSceneBuilder.depthMap,
      tilesSceneBuilder.layerSize.x,
      tilesSceneBuilder.layerSize.y,
      new DepthDebugBufferPreviewColorizer(),
    );
    this.previews.push(preview);

    for (let z = 0; z < 3; z++) {
      const preview = new DebugBufferPreview(
        tilesSceneBuilder.layers[z],
        tilesSceneBuilder.layerSize.x,
        tilesSceneBuilder.layerSize.y,
        new TerrainDebugBufferPreviewColorizer(),
      );
      this.previews.push(preview);
    }
    right.append(...this.previews.map(e => e.canvas));
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
    this.left.innerText = "";
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

    const { size, centerChunk, centerPoint, chunkRect, layer, spaceId, spaceRect, tilesRect } = this.viewport;
    out.push(`Viewport`);
    out.push(`  Axis: ${size.x / 32} ${size.y / 32}`);
    out.push(`  Size: ${size.x} ${size.y}`);
    out.push(`  CenterPoint: ${centerPoint.x} ${centerPoint.y}`);
    out.push(`  CenterChunk: ${centerChunk.x} ${centerChunk.y}`);
    out.push(`  SpaceId: ${spaceId}`);
    out.push(`  Layer: ${layer}`);
    out.push(`  SpaceRect: ${spaceRect.x1} ${spaceRect.y1} ${spaceRect.x2} ${spaceRect.y2}`);
    out.push(`  ChunkRect: ${chunkRect.x1} ${chunkRect.y1} ${chunkRect.x2} ${chunkRect.y2}`);
    out.push(`  TilesRect: ${tilesRect.x1} ${tilesRect.y1} ${tilesRect.x2} ${tilesRect.y2}`);

    out.push(`Scene`);
    out.push(`  AvgBuildTime: ${(this.tilesSceneBuilder.performance.value * 1000).toFixed(0)} µs`);
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

    this.left.textContent = out.join("\n");

    for (const preview of this.previews) {
      preview.update();
    }
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
