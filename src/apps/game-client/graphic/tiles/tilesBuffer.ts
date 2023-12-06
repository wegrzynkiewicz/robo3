import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { provideWebGL } from "../WebGL.ts";

export function provideTilesBuffer(resolver: ServiceResolver) {
  return new DynamicDrawBuffer(
    resolver.resolve(provideWebGL),
    8192 * 8,
  );
}
