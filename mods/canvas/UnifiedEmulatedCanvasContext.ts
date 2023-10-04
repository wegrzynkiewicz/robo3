import { CanvasRenderingContext2D, EmulatedCanvas2D, createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { AbstractUnifiedCanvasContext, UnifiedCanvasContext } from "./UnifiedCanvasContext.ts";

export class UnifiedEmulatedCanvasContext extends AbstractUnifiedCanvasContext implements UnifiedCanvasContext {
  public readonly canvas: EmulatedCanvas2D;
  public readonly context: CanvasRenderingContext2D;
  public constructor(
    public readonly width: number,
    public readonly height: number,
  ) {
    super();
    this.canvas = createCanvas(width, height);
    this.context = this.canvas.getContext('2d');
  }

  public toPNG(): Uint8Array {
    return this.canvas.toBuffer('image/png');
  }

  public dispose() {
    this.canvas.dispose();
  }
}
