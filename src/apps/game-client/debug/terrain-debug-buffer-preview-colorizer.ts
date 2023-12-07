import { DebugBufferPreviewColorizer } from "./debug-buffer-preview.ts";

const colors: Record<number, number[]> = {
  0x00: [0xFF, 0x00, 0xFF],
  0x01: [0x00, 0xFF, 0x00],
  0x06: [0x96, 0x4B, 0x00],
  0xFF: [0x00, 0x00, 0x00],
};
const defaultColor = [0, 0, 0];

export class TerrainDebugBufferPreviewColorizer implements DebugBufferPreviewColorizer {
  public colorize(colorOutput: Uint8Array, bufferItem: number): void {
    const color = colors[bufferItem] ?? defaultColor;
    colorOutput[0] = color[0];
    colorOutput[1] = color[1];
    colorOutput[2] = color[2];
    colorOutput[3] = 255;
  }
}
