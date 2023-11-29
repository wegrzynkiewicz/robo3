import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { webGLService } from "../WebGL.ts";

export const tilesBufferService = registerService({
  name: 'tilesBuffer',
  async provider(resolver: ServiceResolver): Promise<DynamicDrawBuffer> {
    return new DynamicDrawBuffer(
      await resolver.resolve(webGLService),
      8192 * 8,
    );
  },
});
