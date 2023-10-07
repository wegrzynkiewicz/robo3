import { CanvasRenderingContext2D, createCanvas, EmulatedCanvas2D, loadImage } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { AbstractUnifiedCanvasContext, initialize, UnifiedCanvasContextBase } from "./UnifiedCanvasContext.ts";

export class UnifiedEmulatedCanvasContext extends AbstractUnifiedCanvasContext implements UnifiedCanvasContextBase {
  public readonly canvas: EmulatedCanvas2D;
  public readonly context: CanvasRenderingContext2D;

  public constructor(width: number, height: number) {
    super(width, height);
    this.canvas = createCanvas(width, height);
    this.context = this.canvas.getContext("2d");
  }

  public static async createFromImageURL(url: URL): Promise<UnifiedEmulatedCanvasContext> {
    const image = await loadImage(url.toString());
    const emulated = new UnifiedEmulatedCanvasContext(image.width(), image.height());
    emulated.context.drawImage(image, 0, 0);
    return emulated;
  }

  public toPNG(): Uint8Array {
    return this.canvas.toBuffer("image/png");
  }

  public dispose() {
    this.canvas.dispose();
  }
}

initialize(UnifiedEmulatedCanvasContext);
