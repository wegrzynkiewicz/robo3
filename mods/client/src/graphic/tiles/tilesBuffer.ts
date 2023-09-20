import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { webGLService } from "../WebGL.ts";

export const tilesBufferService = registerService({
  async provider(resolver: ServiceResolver): Promise<DynamicDrawBuffer> {
    return new DynamicDrawBuffer(
      await resolver.resolve(webGLService),
      65536 * 2,
    );
  },
});
