import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { dim3D } from "../../../../math/Dim3D.ts";
import { webGLService } from "../WebGL.ts";
import { Texture2DArray } from "../textures/Texture2DArray.ts";
import { spriteIndexPullingTextureFormatConfig } from "../textures/format.ts";

export const spriteIndicesTextureService = registerService({
  async provider(resolver: ServiceResolver): Promise<Texture2DArray> {
    const gl = await resolver.resolve(webGLService);
    return new Texture2DArray(
      gl,
      dim3D(256, 256, 2),
      1,
      spriteIndexPullingTextureFormatConfig,
    );
  },
});
