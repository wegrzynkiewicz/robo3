import { UnifiedEmulatedCanvasContext } from "./UnifiedEmulatedCanvasContext.ts";
import { UnifiedOffscreenCanvasContext } from "./UnifiedOffscreenCanvas.ts";

export interface UnifiedCanvasContext {
  dispose(): void;
  drawImage(image: CanvasImageSource, x: number, y: number): void;
  getImageData(x: number, y: number, w: number, h: number): ImageData
  height: number;
  putImageData(image: ImageData, x: number, y: number): void;
  toPNG(): Uint8Array;
  width: number;
}

export abstract class AbstractUnifiedCanvasContext {
  //   abstract readonly context: CanvasRenderingContext2D;
  abstract readonly context: any
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

export function createUnifiedCanvasContext(width: number, height: number): UnifiedCanvasContext {
  if (typeof Deno === "object") {
    return new UnifiedEmulatedCanvasContext(width, height);
  } else {
    return new UnifiedOffscreenCanvasContext(width, height);
  }
}
