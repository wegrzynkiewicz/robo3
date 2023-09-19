import { assertNonNull } from "../../../common/asserts.ts";
import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { Display, displayService } from "../graphic/Display.ts";
import { Viewport, viewportService } from "../graphic/Viewport.ts";

export class DebugInfo {

  public readonly element: HTMLElement;
  public isEnabled = false;

  public constructor(
    public readonly display: Display,
    public readonly viewport: Viewport,
  ) {
    const element = document.getElementById('debug-info');
    assertNonNull(element);
    this.element = element;
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
    this.element.innerText = '';
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
    out.push(`FPS: ${fps.toFixed(2)}`);
    const { client, scale } = this.display;
    out.push(`DSP-Size: ${client.x} ${client.y}`);
    out.push(`DSP-Scale: ${scale}`);
    const { worldSize: ws, centerPoint: cp, worldSpaceRect: wr } = this.viewport
    out.push(`VP-Axis: ${ws.x / 32} ${ws.y / 32}`);
    out.push(`VP-WorldSize: ${ws.x} ${ws.y}`);
    out.push(`VP-CenterPoint: ${cp.x} ${cp.y}`);
    out.push(`VP-WorldRect: ${wr.x1} ${wr.y1} ${wr.x2} ${wr.y2}`);
    out.push(`VP-Tiles: ${0}`);
    this.element.textContent = out.join('\n');
  }
}

export const debugInfoService = registerService({
  async provider(resolver: ServiceResolver): Promise<DebugInfo> {
    const [display, viewport] = await Promise.all([
      resolver.resolve(displayService),
      resolver.resolve(viewportService),
    ]);
    return new DebugInfo(display, viewport);
  },
});
