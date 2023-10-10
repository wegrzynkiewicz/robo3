import { DebugBufferPreviewColorizer } from "./DebugBufferPreview.ts";

export class DepthDebugBufferPreviewColorizer implements DebugBufferPreviewColorizer {
  public colorize(colorOutput: Uint8Array, bufferItem: number): void {
    const ratio = bufferItem + 1; 
    const value = 255 - Math.floor(ratio / 5 * 255);
    colorOutput[0] = value;
    colorOutput[1] = value;
    colorOutput[2] = value;
    colorOutput[3] = 255;
  }
}
