import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { webGLService } from "../WebGL.ts";

export const tilesBufferService = registerService({
  async provider(resolver: ServiceResolver): Promise<DynamicDrawBuffer> {
    const [gl] = await Promise.all([
      resolver.resolve(webGLService),
    ]);
    return new DynamicDrawBuffer(gl, 65536 * 2);
  },
});
