import { ServiceResolver } from "../../../../../common/dependency/service.ts";
import { dim3D } from "../../../../../common/math/Dim3D.ts";
import { provideWebGL } from "../WebGL.ts";
import { Texture2DArray } from "../textures/Texture2DArray.ts";
import { TextureFormatConfig } from "../textures/format.ts";

export const spriteIndexPullingTextureFormatConfig: TextureFormatConfig = {
  format: WebGL2RenderingContext["RGBA"],
  internal: WebGL2RenderingContext["RGBA32F"],
  type: WebGL2RenderingContext["FLOAT"],
};

export function provideSpriteIndicesTexture(resolver: ServiceResolver) {
  const gl = resolver.resolve(provideWebGL);
  return new Texture2DArray(
    gl,
    dim3D(256, 256, 2),
    1,
    spriteIndexPullingTextureFormatConfig,
  );
}
