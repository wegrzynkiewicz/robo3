import { assertObject } from "../common/asserts.ts";
import { AbstractUnifiedCanvasContext, UnifiedCanvasContext } from "./UnifiedCanvasContext.ts";

export class UnifiedOffscreenCanvasContext extends AbstractUnifiedCanvasContext implements UnifiedCanvasContext {
  public readonly canvas: OffscreenCanvas;
  public readonly context: OffscreenCanvasRenderingContext2D;
  public constructor(
    public readonly width: number,
    public readonly height: number,
  ) {
    super();
    this.canvas = new OffscreenCanvas(width, height)
    const context = this.canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    assertObject(context);
    this.context = context;
  }

  public dispose(): void { }

  public toPNG(): Uint8Array {
    throw new Error('not-implemented');
  }
}
