export interface UnifiedCanvasContextBase {
  dispose(): void;
  drawImage(image: CanvasImageSource, x: number, y: number): void;
  getImageData(x: number, y: number, w: number, h: number): ImageData;
  height: number;
  putImageData(image: ImageData, x: number, y: number): void;
  toPNG(): Uint8Array;
  width: number;
}

export interface UnifiedCanvasContextConstructor {
  new (w: number, h: number): UnifiedCanvasContextBase;
  createFromImageURL(url: URL): Promise<UnifiedCanvasContextBase>
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

function fail () {
  throw new Error('invalid-unified-canvas-context-import-direct');
}
fail.createFromImageURL = fail;

export let UnifiedCanvasContext: UnifiedCanvasContextConstructor = fail as any;
export function initialize(em: UnifiedCanvasContextConstructor) {
  UnifiedCanvasContext = em;
}
