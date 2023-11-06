import { Breaker } from "../../../../common/asserts.ts";
import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { dim3D } from "../../../../math/Dim3D.ts";
import { webGLService } from "../WebGL.ts";
import { Texture2DArray } from "../textures/Texture2DArray.ts";
import { fromCanvasTextureFormatConfig } from "../textures/format.ts";

const requiredTextureSize = 1024;
const requiredArrayLayers = 4;

export const tilesTexture2DArrayService = registerService({
  async provider(resolver: ServiceResolver): Promise<Texture2DArray> {
    const gl = await resolver.resolve(webGLService);

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const textureSize = Math.min(maxTextureSize, requiredTextureSize);
    if (textureSize < requiredTextureSize) {
      throw new Breaker("engine-require-min-array-texture-layers", { requiredArrayLayers });
    }

    const maxArrayTextureLayers = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
    const depth = Math.min(maxArrayTextureLayers, requiredArrayLayers);
    if (depth < requiredArrayLayers) {
      throw new Breaker("engine-require-min-array-texture-layers", { requiredArrayLayers });
    }

    const dim = dim3D(textureSize, textureSize, depth);

    return new Texture2DArray(
      gl,
      dim,
      0,
      fromCanvasTextureFormatConfig,
    );
  },
});
