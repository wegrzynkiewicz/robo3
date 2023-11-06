export interface UnifiedCanvasContext {
  canvas: any,
  context: any,
  dispose(): void;
  drawImage(image: CanvasImageSource, x: number, y: number): void;
  getImageData(x: number, y: number, w: number, h: number): ImageData;
  height: number;
  putImageData(image: ImageData, x: number, y: number): void;
  toHTMLCanvas(): HTMLCanvasElement;
  toPNG(): Uint8Array;
  width: number;
}

export interface UnifiedCanvasContextConstructor {
  new(w: number, h: number): UnifiedCanvasContext;
  createFromImageURL(url: URL): Promise<UnifiedCanvasContext>
}

export abstract class AbstractUnifiedCanvasContext {
  abstract readonly context: any;

  public constructor(
    public readonly width: number,
    public readonly height: number,
  ) { }

  public drawImage(image: CanvasImageSource, x: number, y: number): void {
    this.context.drawImage(image, x, y);
  }

  public getImageData(x: number, y: number, w: number, h: number): ImageData {
    return this.context.getImageData(x, y, w, h);
  }

  public toHTMLCanvas(): HTMLCanvasElement {
    const { width, height } = this;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
    if (typeof context !== "object" || context === null) {
      throw new Error('cannot-get-2d-context-from-canvas');
    }
    const image = this.context.getImageData(0, 0, width, height);
    context.putImageData(image, 0, 0);
    context.save();
    return canvas;
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
