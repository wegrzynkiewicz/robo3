import { UnifiedEmulatedCanvasContext } from "./UnifiedEmulatedCanvasContext.ts";
import { UnifiedOffscreenCanvasContext } from "./UnifiedOffscreenCanvas.ts";

export interface UnifiedCanvasContextBase {
  dispose(): void;
  drawImage(image: CanvasImageSource, x: number, y: number): void;
  getImageData(x: number, y: number, w: number, h: number): ImageData;
  height: number;
  putImageData(image: ImageData, x: number, y: number): void;
  toPNG(): Uint8Array;
  width: number;
}

export abstract class AbstractUnifiedCanvasContext {
  //   abstract readonly context: CanvasRenderingContext2D;
  abstract readonly context: any;
  public drawImage(image: CanvasImageSource, x: number, y: number): void {
    this.context.drawImage(image, x, y);
  }
  public getImageData(x: number, y: number, w: number, h: number): ImageData {
    return this.context.getImageData(x, y, w, h);
  }
  public putImageData(image: ImageData, x: number, y: number): void {
    this.context.putImageData(image, x, y);
  }
}

export const UnifiedCanvasContext = typeof Deno === "object" ? UnifiedEmulatedCanvasContext : UnifiedOffscreenCanvasContext;
