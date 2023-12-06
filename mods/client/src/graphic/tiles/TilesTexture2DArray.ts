import { Breaker } from "../../../../common/breaker.ts";
import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { dim3D } from "../../../../math/Dim3D.ts";
import { webGLService } from "../WebGL.ts";
import { Texture2DArray } from "../textures/Texture2DArray.ts";
import { TextureFormatConfig } from "../textures/format.ts";

const requiredTextureSize = 1024;
const requiredArrayLayers = 4;

export const fromCanvasTextureFormatConfig: TextureFormatConfig = {
  format: WebGL2RenderingContext["RGBA"],
  internal: WebGL2RenderingContext["RGBA8"],
  type: WebGL2RenderingContext["UNSIGNED_BYTE"],
};

export function provideTexture2DArray(resolver: ServiceResolver) {
  const gl = resolver.resolve(provideWebGL);

  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const textureSize = Math.min(maxTextureSize, requiredTextureSize);
  if (textureSize < requiredTextureSize) {
    throw new Breaker("engine-require-min-texture-size", { maxTextureSize, requiredTextureSize });
  }

  const maxArrayTextureLayers = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
  const depth = Math.min(maxArrayTextureLayers, requiredArrayLayers);
  if (depth < requiredArrayLayers) {
    throw new Breaker("engine-require-min-array-texture-layers", { maxArrayTextureLayers, requiredArrayLayers });
  }

  const dim = dim3D(textureSize, textureSize, depth);

  return new Texture2DArray(
    gl,
    dim,
    0,
    fromCanvasTextureFormatConfig,
  );
}
