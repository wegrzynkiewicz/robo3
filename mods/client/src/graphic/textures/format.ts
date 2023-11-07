export type TextureInternalFormat =
  | WebGL2RenderingContext["ALPHA"]
  | WebGL2RenderingContext["DEPTH24_STENCIL8"]
  | WebGL2RenderingContext["DEPTH32F_STENCIL8"]
  | WebGL2RenderingContext["DEPTH_COMPONENT16"]
  | WebGL2RenderingContext["DEPTH_COMPONENT24"]
  | WebGL2RenderingContext["DEPTH_COMPONENT32F"]
  | WebGL2RenderingContext["LUMINANCE"]
  | WebGL2RenderingContext["LUMINANCE_ALPHA"]
  | WebGL2RenderingContext["R11F_G11F_B10F"]
  | WebGL2RenderingContext["R16F"]
  | WebGL2RenderingContext["R16I"]
  | WebGL2RenderingContext["R16UI"]
  | WebGL2RenderingContext["R32F"]
  | WebGL2RenderingContext["R32I"]
  | WebGL2RenderingContext["R32UI"]
  | WebGL2RenderingContext["R8"]
  | WebGL2RenderingContext["R8I"]
  | WebGL2RenderingContext["R8UI"]
  | WebGL2RenderingContext["R8_SNORM"]
  | WebGL2RenderingContext["RG16F"]
  | WebGL2RenderingContext["RG16I"]
  | WebGL2RenderingContext["RG16UI"]
  | WebGL2RenderingContext["RG32F"]
  | WebGL2RenderingContext["RG32I"]
  | WebGL2RenderingContext["RG32UI"]
  | WebGL2RenderingContext["RG8"]
  | WebGL2RenderingContext["RG8I"]
  | WebGL2RenderingContext["RG8UI"]
  | WebGL2RenderingContext["RG8_SNORM"]
  | WebGL2RenderingContext["RGB"]
  | WebGL2RenderingContext["RGB10_A2"]
  | WebGL2RenderingContext["RGB10_A2UI"]
  | WebGL2RenderingContext["RGB16F"]
  | WebGL2RenderingContext["RGB16I"]
  | WebGL2RenderingContext["RGB16UI"]
  | WebGL2RenderingContext["RGB32F"]
  | WebGL2RenderingContext["RGB32I"]
  | WebGL2RenderingContext["RGB32UI"]
  | WebGL2RenderingContext["RGB565"]
  | WebGL2RenderingContext["RGB5_A1"]
  | WebGL2RenderingContext["RGB8"]
  | WebGL2RenderingContext["RGB8I"]
  | WebGL2RenderingContext["RGB8UI"]
  | WebGL2RenderingContext["RGB8_SNORM"]
  | WebGL2RenderingContext["RGB9_E5"]
  | WebGL2RenderingContext["RGBA"]
  | WebGL2RenderingContext["RGBA16F"]
  | WebGL2RenderingContext["RGBA16I"]
  | WebGL2RenderingContext["RGBA16UI"]
  | WebGL2RenderingContext["RGBA32F"]
  | WebGL2RenderingContext["RGBA32I"]
  | WebGL2RenderingContext["RGBA32UI"]
  | WebGL2RenderingContext["RGBA4"]
  | WebGL2RenderingContext["RGBA8"]
  | WebGL2RenderingContext["RGBA8I"]
  | WebGL2RenderingContext["RGBA8UI"]
  | WebGL2RenderingContext["RGBA8_SNORM"]
  | WebGL2RenderingContext["SRGB8"]
  | WebGL2RenderingContext["SRGB8_ALPHA8"];

export type TextureFormat =
  | WebGL2RenderingContext["ALPHA"]
  | WebGL2RenderingContext["DEPTH_COMPONENT"]
  | WebGL2RenderingContext["DEPTH_STENCIL"]
  | WebGL2RenderingContext["LUMINANCE"]
  | WebGL2RenderingContext["LUMINANCE_ALPHA"]
  | WebGL2RenderingContext["RED"]
  | WebGL2RenderingContext["RED_INTEGER"]
  | WebGL2RenderingContext["RG"]
  | WebGL2RenderingContext["RGB"]
  | WebGL2RenderingContext["RGBA"]
  | WebGL2RenderingContext["RGBA_INTEGER"]
  | WebGL2RenderingContext["RGB_INTEGER"]
  | WebGL2RenderingContext["RG_INTEGER"];

export type TextureFormatType =
  | WebGL2RenderingContext["BYTE"]
  | WebGL2RenderingContext["FLOAT"]
  | WebGL2RenderingContext["FLOAT_32_UNSIGNED_INT_24_8_REV"]
  | WebGL2RenderingContext["HALF_FLOAT"]
  | WebGL2RenderingContext["INT"]
  | WebGL2RenderingContext["SHORT"]
  | WebGL2RenderingContext["UNSIGNED_BYTE"]
  | WebGL2RenderingContext["UNSIGNED_INT"]
  | WebGL2RenderingContext["UNSIGNED_INT_10F_11F_11F_REV"]
  | WebGL2RenderingContext["UNSIGNED_INT_2_10_10_10_REV"]
  | WebGL2RenderingContext["UNSIGNED_INT_24_8"]
  | WebGL2RenderingContext["UNSIGNED_INT_5_9_9_9_REV"]
  | WebGL2RenderingContext["UNSIGNED_SHORT"]
  | WebGL2RenderingContext["UNSIGNED_SHORT_4_4_4_4"]
  | WebGL2RenderingContext["UNSIGNED_SHORT_5_5_5_1"]
  | WebGL2RenderingContext["UNSIGNED_SHORT_5_6_5"];

export interface TextureFormatConfig {
  format: TextureFormat;
  internal: TextureInternalFormat;
  type: TextureFormatType;
}

export const fromCanvasTextureFormatConfig: TextureFormatConfig = {
  format: WebGL2RenderingContext["RGBA"],
  internal: WebGL2RenderingContext["RGBA8"],
  type: WebGL2RenderingContext["UNSIGNED_BYTE"],
};

export const spriteIndexPullingTextureFormatConfig: TextureFormatConfig = {
  format: WebGL2RenderingContext["RGBA"],
  internal: WebGL2RenderingContext["RGBA32F"],
  type: WebGL2RenderingContext["FLOAT"],
};
