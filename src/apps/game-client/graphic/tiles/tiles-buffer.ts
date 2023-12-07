import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { DynamicDrawBuffer } from "../dynamic-draw-buffer.ts";
import { provideWebGL } from "../web-gl.ts";

export function provideTilesBuffer(resolver: ServiceResolver) {
  return new DynamicDrawBuffer(
    resolver.resolve(provideWebGL),
    8192 * 8,
  );
}
