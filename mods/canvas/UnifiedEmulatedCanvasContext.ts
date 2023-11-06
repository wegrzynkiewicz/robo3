import { AbstractUnifiedCanvasContext, initialize, UnifiedCanvasContext } from "./common.ts";
import { EmulatedCanvasRenderingContext2D, createCanvas, EmulatedCanvas2D, loadImage } from "./deps.ts";

export class UnifiedEmulatedCanvasContext extends AbstractUnifiedCanvasContext implements UnifiedCanvasContext {
  public readonly canvas: EmulatedCanvas2D;
  public readonly context: EmulatedCanvasRenderingContext2D;

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
