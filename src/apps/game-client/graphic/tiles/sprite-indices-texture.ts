import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { dim3D } from "../../../../common/math/dim3d.ts";
import { provideWebGL } from "../web-gl.ts";
import { Texture2DArray } from "../textures/texture2darray.ts";
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
