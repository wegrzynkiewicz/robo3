import { UnifiedCanvasContext, unifiedCanvasContextConstructor } from "./common.ts";

export type { UnifiedCanvasContext };

export function createUnifiedCanvas(width: number, height: number): UnifiedCanvasContext {
  return new unifiedCanvasContextConstructor(width, height);
}

export function createUnifiedCanvasFromImageURL(url: URL): Promise<UnifiedCanvasContext> {
  return unifiedCanvasContextConstructor.createFromImageURL(url);
}
