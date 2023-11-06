import { Dim2D, dim2D } from "../math/Dim2D.ts";

export interface UnifiedCanvasContext {
  canvas: any,
  context: any,
  dim: Dim2D,
  dispose(): void;
  drawImage(image: CanvasImageSource, x: number, y: number): void;
  getImageData(x: number, y: number, w: number, h: number): ImageData;
  height: number;
  putImageData(image: ImageData, x: number, y: number): void;
  toPNG(): Uint8Array;
  width: number;
}

export interface UnifiedCanvasContextConstructor {
  new(w: number, h: number): UnifiedCanvasContext;
  createFromImageURL(url: URL): Promise<UnifiedCanvasContext>
}

export abstract class AbstractUnifiedCanvasContext {
  abstract readonly context: any;
  public readonly dim: Dim2D;

  public constructor(
    public readonly width: number,
    public readonly height: number,
  ) {
    this.dim = dim2D(width, height);
  }

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

function fail() {
  throw new Error('invalid-unified-canvas-context-import-direct');
}
fail.createFromImageURL = fail;

export let unifiedCanvasContextConstructor: UnifiedCanvasContextConstructor = fail as any;
export function initialize(constructor: UnifiedCanvasContextConstructor) {
  unifiedCanvasContextConstructor = constructor;
}
