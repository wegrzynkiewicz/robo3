import { TypedArray } from "../../../common/binary.ts";

export interface DebugBufferPreviewColorizer {
  colorize(colorOutput: Uint8Array, bufferItem: number): void;
}

export class DebugBufferPreview<T extends TypedArray> {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;
  public readonly colorBuffer: Uint8Array = new Uint8Array(4);

  public constructor(
    public readonly buffer: T,
    public readonly width: number,
    public readonly height: number,
    public readonly colorizer: DebugBufferPreviewColorizer,
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.classList.add("debug-buffer-preview");
    this.canvas.style.width = `${width * 6}px`;
    this.canvas.style.height = `${height * 6}px`;
    this.context = this.canvas.getContext("2d", { willReadFrequently: true })!;
  }

  public update(): void {
    const { buffer, colorBuffer, colorizer, context, height, width } = this;
    const image = context.getImageData(0, 0, width, height);
    const { data } = image;
    let offset = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const value = buffer[index];
        colorizer.colorize(colorBuffer, value);
        data[offset++] = colorBuffer[0];
        data[offset++] = colorBuffer[1];
        data[offset++] = colorBuffer[2];
        data[offset++] = colorBuffer[3];
      }
    }
    context.putImageData(image, 0, 0);
  }
}
