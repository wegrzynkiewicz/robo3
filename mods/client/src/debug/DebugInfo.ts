import { assertNonNull } from "../../../common/asserts.ts";
import { formatBytes } from "../../../common/useful.ts";
import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
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
    const { client, scale } = this.display;
    out.push(`Display`);
    out.push(`  FPS: ${fps.toFixed(2)}`);
    out.push(`  Size: ${client.x} ${client.y}`);
    out.push(`  Scale: ${scale}`);
    const { worldSize: ws, centerPoint: cp, worldSpaceRect: wr } = this.viewport;
    out.push(`Viewport`);
    out.push(`  Axis: ${ws.x / 32} ${ws.y / 32}`);
    out.push(`  WorldSize: ${ws.x} ${ws.y}`);
    out.push(`  CenterPoint: ${cp.x} ${cp.y}`);
    out.push(`  WorldRect: ${wr.x1} ${wr.y1} ${wr.x2} ${wr.y2}`);
    out.push(`Scene`);
    out.push(`  VisibleTiles: ${this.tilesSceneBuilder.visibleTiles}`);
    const bs = this.tilesBuffer.bytesSent;
    out.push(`  BytesSent: ${bs} (${formatBytes(bs)})`);
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
    );
  },
});
