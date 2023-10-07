import { assertObject } from "../common/asserts.ts";
import { loadImage } from "../common/useful.ts";
import { AbstractUnifiedCanvasContext, UnifiedCanvasContextBase, initialize } from "./UnifiedCanvasContext.ts";

export class UnifiedOffscreenCanvasContext extends AbstractUnifiedCanvasContext implements UnifiedCanvasContextBase {
  public readonly canvas: OffscreenCanvas;
  public readonly context: OffscreenCanvasRenderingContext2D;

  public constructor(width: number, height: number) {
    super(width, height);
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

initialize(UnifiedOffscreenCanvasContext);
