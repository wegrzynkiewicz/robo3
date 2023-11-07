import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { dim2D } from "../../../../math/Dim2D.ts";
import { webGLService } from "../WebGL.ts";
import { Texture2D } from "../textures/Texture2D.ts";
import { spriteIndexPullingTextureFormatConfig } from "../textures/format.ts";

export const spriteIndicesTextureService = registerService({
  async provider(resolver: ServiceResolver): Promise<Texture2D> {
    const gl = await resolver.resolve(webGLService);
    return new Texture2D(
      gl,
      dim2D(256, 256),
      1,
      spriteIndexPullingTextureFormatConfig,
    );
  },
});
