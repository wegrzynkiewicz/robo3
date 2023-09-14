import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { TILE_SIZE, SCREEN_MAX_VISIBLE_TILE_X, SCREEN_MAX_VISIBLE_TILE_Y } from "../../../core/vars.ts";
import { point } from "../../../math/Point.ts";
import { Viewport, viewportService } from "./Viewport.ts";
import { webGLService } from "./WebGL.ts";

export class Display {

  private _scale = 1.0;
  public readonly client = point(0, 0);

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly viewport: Viewport,
  ) {

  }

  get scale(): number {
    return this._scale;
  }

  set scale(scale: number) {
    scale = Math.floor(scale);
    if (scale < 1 || scale > 3) {
      throw new Error("invalid-screen-scale");
    }
    this._scale = scale;
    this.resize();
  }

  public setClientSize(x: number, y: number) {
    this.client.x = x;
    this.client.y = y;
    this.resize();
  }

  protected resize(): void {
    const { client, gl, gl: { canvas }, scale, viewport } = this;
    const bodyTileW = Math.floor(client.x / TILE_SIZE / scale);
    const bodyTileH = Math.floor(client.y / TILE_SIZE / scale);
    const tileW = Math.min(bodyTileW, SCREEN_MAX_VISIBLE_TILE_X - 1) + 1;
    const tileH = Math.min(bodyTileH, SCREEN_MAX_VISIBLE_TILE_Y - 1) + 1;
    const worldW = tileW * TILE_SIZE;
    const worldH = tileH * TILE_SIZE;
    const canvasW = worldW * scale;
    const canvasH = worldH * scale;
    canvas.width = canvasW;
    canvas.height = canvasH;

    viewport.setWorldSize(worldW, worldH);
    gl.viewport(0, 0, canvasW, canvasH);
  }
}

export const displayService = registerService({
  async provider(resolver: ServiceResolver) {
    const [gl, viewport] = await Promise.all([
      resolver.resolve(webGLService),
      resolver.resolve(viewportService),
    ]);
    return new Display(gl, viewport);
  },
});
