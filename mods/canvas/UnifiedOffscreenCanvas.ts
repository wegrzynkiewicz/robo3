import { assertObject } from "../common/asserts.ts";
import { loadImage } from "../common/useful.ts";
import { AbstractUnifiedCanvasContext, UnifiedCanvasContextBase } from "./UnifiedCanvasContext.ts";

export class UnifiedOffscreenCanvasContext extends AbstractUnifiedCanvasContext implements UnifiedCanvasContextBase {
  public readonly canvas: OffscreenCanvas;
  public readonly context: OffscreenCanvasRenderingContext2D;
  public constructor(
    public readonly width: number,
    public readonly height: number,
  ) {
    super();
    this.canvas = new OffscreenCanvas(width, height);
    const context = this.canvas.getContext("2d", { alpha: true, willReadFrequently: true });
    assertObject(context);
    this.context = context;
  }

  public static async createFromImageURL(url: URL): Promise<UnifiedOffscreenCanvasContext> {
    const image = await loadImage(url);
    const emulated = new UnifiedOffscreenCanvasContext(image.width, image.height);
    emulated.context.drawImage(image, 0, 0);
    return emulated;
  }

  public dispose(): void {}

  public toPNG(): Uint8Array {
    throw new Error("not-implemented");
  }
}
