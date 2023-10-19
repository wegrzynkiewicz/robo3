import { DebugBufferPreviewColorizer } from "./DebugBufferPreview.ts";

export class DepthDebugBufferPreviewColorizer implements DebugBufferPreviewColorizer {
  public colorize(colorOutput: Uint8Array, bufferItem: number): void {
    const value = bufferItem === 255 ? 0 : Math.floor(bufferItem / 16 * 255);
    colorOutput[0] = value;
    colorOutput[1] = value;
    colorOutput[2] = value;
    colorOutput[3] = 255;
  }
}
