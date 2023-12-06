import { assertNonNull } from "../../../../common/utils/asserts.ts";
import { formatBytes } from "../../../../common/utils/useful.ts";
import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { NetworkLatencyCounter, provideNetworkLatencyCounter } from "../../../../actions/stats/NetworkLatencyCounter.ts";
import { FPSCounter, provideFPSCounter } from "../FPSCounter.ts";
import { Display, provideDisplay } from "../graphic/Display.ts";
import { DynamicDrawBuffer } from "../graphic/DynamicDrawBuffer.ts";
import { provideViewport, Viewport } from "../graphic/Viewport.ts";
import { provideTilesSceneBuilder, TilesSceneBuilder } from "../graphic/tiles/TilesSceneBuilder.ts";
import { provideTilesBuffer } from "../graphic/tiles/tilesBuffer.ts";
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
    public readonly fpsCounter: FPSCounter,
    public readonly networkLatencyCounter: NetworkLatencyCounter,
    public readonly tilesBuffer: DynamicDrawBuffer,
    public readonly tilesSceneBuilder: TilesSceneBuilder,
    public readonly viewport: Viewport,
  ) {
    const left = document.getElementById("debug-info-left");
    const right = document.getElementById("debug-info-right");
    assertNonNull(left);
    assertNonNull(right);
    this.left = left;
    this.right = right;

    const { x, y } = tilesSceneBuilder.sceneViewport.grid.available.size;

    const main = new DebugBufferPreview(
      tilesSceneBuilder.tilesLayer,
      x,
      y,
      new TerrainDebugBufferPreviewColorizer(),
    );
    this.previews.push(main);

    const preview = new DebugBufferPreview(
      tilesSceneBuilder.depthLayer,
      x,
      y,
      new DepthDebugBufferPreviewColorizer(),
    );
    this.previews.push(preview);
  }

  public enable() {
    this.isEnabled = true;
    this.right.append(...this.previews.map((e) => e.canvas));
  }

  public disable() {
    this.isEnabled = false;
    this.left.innerText = "";
    this.right.innerText = "";
  }

  public toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  public loop() {
    if (this.isEnabled === false) {
      return;
    }
    const out = [];
    const { client } = this.display;
    out.push(`Display`);
    out.push(`  FPS: ${this.fpsCounter.fps.toFixed(2)}`);
    out.push(`  Size: ${client.x} ${client.y}`);
    out.push(`  Scale: ${this.display.getScale()}`);

    out.push(`Network`);
    {
      out.push(`  Ping: ${this.networkLatencyCounter.ping.toFixed(2)} ms`);
    }

    out.push(`Viewport`);
    {
      const { size, centerChunk, centerPoint, chunkRect, level, spaceId, spaceRect, tilesRect } = this.viewport;
      out.push(`  Axis: ${size.x / 32} ${size.y / 32}`);
      out.push(`  Size: ${size.x} ${size.y}`);
      out.push(`  CenterPoint: ${centerPoint.x} ${centerPoint.y}`);
      out.push(`  CenterChunk: ${centerChunk.x} ${centerChunk.y}`);
      out.push(`  SpaceId: ${spaceId}`);
      out.push(`  Level: ${level}`);
      out.push(`  SpaceRect: ${spaceRect.x1} ${spaceRect.y1} ${spaceRect.x2} ${spaceRect.y2}`);
      out.push(`  ChunkRect: ${chunkRect.x1} ${chunkRect.y1} ${chunkRect.x2} ${chunkRect.y2}`);
      out.push(`  TilesRect: ${tilesRect.x1} ${tilesRect.y1} ${tilesRect.x2} ${tilesRect.y2}`);
    }

    out.push(`Scene`);
    {
      const {
        performance,
        sceneViewport: {
          chunkRect,
          grid: {
            available,
          },
          tilesRect,
        },
        tiles: {
          visibleTiles,
        },
      } = this.tilesSceneBuilder;
      out.push(`  AvgBuildTime: ${(performance.avgTime * 1000).toFixed(0)} µs`);
      out.push(`  Grid.available: ${available.size.x} * ${available.size.y} = ${available.cellCount}`);
      const bs = this.tilesBuffer.bytesSent;
      out.push(`  ChunkRect: ${chunkRect.x1} ${chunkRect.y1} ${chunkRect.x2} ${chunkRect.y2} `);
      out.push(`  TilesRect: ${tilesRect.x1} ${tilesRect.y1} ${tilesRect.x2} ${tilesRect.y2} `);
      out.push(`  ProcessedTiles: ${this.tilesSceneBuilder.processedTile} `);
      out.push(`  VisibleTiles: ${visibleTiles} `);
      out.push(`  BytesSent: ${bs} (${formatBytes(bs)})`);
    }

    out.push(`Chunks`);
    out.push(`  Loaded: 0 `);
    out.push(`  Visible: ${this.tilesSceneBuilder.visibleChunks.length} `);
    if (this.tilesSceneBuilder.visibleChunks.length > 0) {
      out.push(`  Visible`);
      for (const chunk of this.tilesSceneBuilder.visibleChunks) {
        const { chunkId, chunkId: { x, y, z }, worldSpaceRect: r } = chunk;
        out.push(`    Id: ${chunkId.key} `);
        out.push(`      Position: ${x} ${y} ${z} `);
        out.push(`      SpaceRect: ${r.x1} ${r.y1} ${r.x2} ${r.y2} `);
      }
    }

    this.left.textContent = out.join("\n");

    for (const preview of this.previews) {
      preview.update();
    }
  }
}

export function provideDebugInfo(resolver: ServiceResolver) {
  return new DebugInfo(
    resolver.resolve(provideDisplay),
    resolver.resolve(provideFPSCounter),
    resolver.resolve(provideNetworkLatencyCounter),
    resolver.resolve(provideTilesBuffer),
    resolver.resolve(provideTilesSceneBuilder),
    resolver.resolve(provideViewport),
  );
}
