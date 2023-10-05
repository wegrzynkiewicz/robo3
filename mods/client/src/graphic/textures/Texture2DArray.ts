import { Breaker } from "../../../../common/asserts.ts";
import { Dim3D } from "../../../../math/Dim3D.ts";
import { createTexture } from "../utilities.ts";
import { TextureFormatConfig } from "./format.ts";

const { TEXTURE_2D_ARRAY } = WebGL2RenderingContext;

export class Texture2DArray {
  public glTexture: WebGLTexture;

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly dim: Dim3D,
    public readonly formatConfig: TextureFormatConfig,
  ) {
    this.glTexture = createTexture(gl);
    this.bind();
    this.gl.texStorage3D(
      TEXTURE_2D_ARRAY,
      1,
      formatConfig.internal,
      dim.w,
      dim.h,
      dim.d,
    );
  }

  public bind(): void {
    this.gl.bindTexture(TEXTURE_2D_ARRAY, this.glTexture);
  }

  public dispose(): void {
    this.gl.deleteTexture(this.glTexture);
  }

  public update(offsetZ: number, data: ImageData) {
    this.bind();
    const { dim, dim: { d, h, w }, formatConfig: { format, type } } = this;
    if (offsetZ > d) {
      throw new Breaker('texture-offset-z-overflow-dimensions', { dim, offsetZ });
    }
    this.gl.texSubImage3D(
      TEXTURE_2D_ARRAY,
      0,
      0,
      0,
      offsetZ,
      w,
      h,
      1,
      format,
      type,
      data,
    )
  }
}
