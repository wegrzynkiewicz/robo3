import { TypedArray } from "../../../../common/utils/binary.ts";
import { Dim2D } from "../../../../common/math/Dim2D.ts";
import { createSampler, createTexture } from "../utilities.ts";
import { TextureFormatConfig } from "./format.ts";

export class Texture2D {
  public readonly glSampler: WebGLSampler;
  public readonly glTexture: WebGLTexture;

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly dim: Dim2D,
    public readonly textureUnit: number,
    public readonly formatConfig: TextureFormatConfig,
  ) {
    this.glTexture = createTexture(gl);
    this.gl.activeTexture(gl.TEXTURE0 + textureUnit);
    this.bind();
    this.gl.texStorage2D(
      gl.TEXTURE_2D,
      1,
      this.formatConfig.internal,
      this.dim.w,
      this.dim.h,
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
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
  }

  public dispose(): void {
    const { gl, glTexture } = this;
    gl.deleteTexture(glTexture);
  }

  public update(data: TypedArray | ImageData) {
    this.bind();
    const { dim: { h, w }, formatConfig: { format, type }, gl } = this;
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      w,
      h,
      format,
      type,
      // @ts-ignore: any type here
      data,
    );
  }
}
