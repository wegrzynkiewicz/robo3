import { Breaker } from "../../../../common/asserts.ts";
import { TypedArray } from "../../../../common/binary.ts";
import { Dim3D } from "../../../../math/Dim3D.ts";
import { createSampler, createTexture } from "../utilities.ts";
import { TextureFormatConfig } from "./format.ts";

export class Texture2DArray {
  public readonly glSampler: WebGLSampler;
  public readonly glTexture: WebGLTexture;

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly dim: Dim3D,
    public readonly textureUnit: number,
    public readonly formatConfig: TextureFormatConfig,
  ) {
    this.glTexture = createTexture(gl);
    this.gl.activeTexture(gl.TEXTURE0 + textureUnit);
    this.bind();
    this.gl.texStorage3D(
      gl.TEXTURE_2D_ARRAY,
      1,
      this.formatConfig.internal,
      this.dim.w,
      this.dim.h,
      this.dim.d,
    );
    this.glSampler = createSampler(gl);
    gl.samplerParameteri(this.glSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.samplerParameteri(this.glSampler, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.samplerParameteri(this.glSampler, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.samplerParameteri(this.glSampler, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.gl.bindSampler(textureUnit, this.glSampler);
  }

  public bind(): void {
    const { gl, glTexture, textureUnit } = this;
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, glTexture);
  }

  public dispose(): void {
    const { gl, glTexture } = this;
    gl.deleteTexture(glTexture);
  }

  public update(offsetZ: number, data: TypedArray | ImageData) {
    this.bind();
    const { dim, dim: { d, h, w }, formatConfig: { format, type }, gl } = this;
    if (offsetZ > d) {
      throw new Breaker("texture-offset-z-overflow-dimensions", { dim, offsetZ });
    }
    gl.texSubImage3D(
      gl.TEXTURE_2D_ARRAY,
      0,
      0,
      0,
      offsetZ,
      w,
      h,
      1,
      format,
      type,
      // @ts-ignore: accept any data type
      data,
    );
  }
}
