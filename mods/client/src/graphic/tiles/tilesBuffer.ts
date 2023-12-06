import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { webGLService } from "../WebGL.ts";

export function provideDynamicDrawBuffer(resolver: ServiceResolver) {
  return new DynamicDrawBuffer(
    resolver.resolve(provideWebGL),
    8192 * 8,
  );
}
