import { ServiceResolver } from "../../../common/dependency/service.ts";
import { SCREEN_MAX_VISIBLE_TILE_X, SCREEN_MAX_VISIBLE_TILE_Y, TILE_SIZE } from "../../../core/vars.ts";
import { pos2D } from "../../../common/math/pos2d.ts";
import { provideViewport, Viewport } from "./viewport.ts";
import { provideWebGL } from "./web-gl.ts";

export class Display {
  protected scale = 1.0;
  public readonly client = pos2D(0, 0);

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly viewport: Viewport,
  ) {}

  public getScale() {
    return this.scale;
  }

  public setScale(scale: number) {
    scale = Math.floor(scale);
    if (scale < 1 || scale > 3) {
      throw new Error("invalid-screen-scale");
    }
    this.scale = scale;
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

export function provideDisplay(resolver: ServiceResolver) {
  return new Display(
    resolver.resolve(provideWebGL),
    resolver.resolve(provideViewport),
  );
}
