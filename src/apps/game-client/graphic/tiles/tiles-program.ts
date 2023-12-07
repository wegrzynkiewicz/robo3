import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { DynamicDrawBuffer } from "../dynamic-draw-buffer.ts";
import { VertexAttribute } from "../attribute.ts";
import { Texture2DArray } from "../textures/texture2darray.ts";
import { i32, ivec } from "../types.ts";
import { createProgram, createVertexArray } from "../utilities.ts";
import { assertNonNull } from "../../../../common/utils/asserts.ts";
import { provideWebGL } from "../web-gl.ts";
import { provideTilesBuffer } from "./tiles-buffer.ts";
import { provideSpriteIndicesTexture } from "./sprite-indices-texture.ts";
import { provideTilesTexture2DArray } from "./tiles-texture2darray.ts";

const byteStride = (2 * 2) + (1 * 4);
const tilePos = new VertexAttribute({ byteOffset: 0, byteStride, divisor: 1, location: 0, name: "tilePos", type: ivec(2, "i16") });
const tileAlpha = new VertexAttribute({ byteOffset: 4, byteStride, divisor: 1, location: 1, name: "tileAlpha", type: i32() });

const vertexShader = `#version 300 es

${tilePos.toShaderLine()}
${tileAlpha.toShaderLine()}

out vec3 v_texCoords;
out float v_alpha;

//    3 - 5
// 0    \ |
// | \    4
// 1 _ 2

const vec2 u_vertices[6] = vec2[6](
  vec2(0.0, 0.0),
  vec2(0.0, -1.0),
  vec2(1.0, -1.0),

  vec2(0.0, 0.0),
  vec2(1.0, -1.0),
  vec2(1.0, 0.0)
);

const vec3 u_textures[6] = vec3[6](
  vec3(0.0, 0.0, 0.0),
  vec3(0.0, 1.0, 0.0),
  vec3(1.0, 1.0, 0.0),

  vec3(0.0, 0.0, 0.0),
  vec3(1.0, 1.0, 0.0),
  vec3(1.0, 0.0, 0.0)
);

uniform Primary {
  uniform mat4 u_projection;
  uniform mat4 u_view;
  uniform vec4 u_texSpriteGraphicSize;
  uniform vec4 u_texSpriteIndicesSize;
  uniform vec4 u_pixelOffset;
};

uniform highp sampler2DArray u_spriteIndices;

float TEXTURE_SIZE = 1024.0;

void main(void) {

  int y = tileAlpha / 256;
  int x = tileAlpha % 256;
  vec4 layer1 = texelFetch(u_spriteIndices, ivec3(x - 1, y, 0), 0);
  vec4 layer2 = texelFetch(u_spriteIndices, ivec3(x - 1, y, 1), 0);

  vec3 texMapping = layer1.xyz;
  vec3 texSize    = vec3(layer2.xy, 0.0);
  vec2 tileSize   = layer2.zw;

  vec2 localSpace = u_vertices[gl_VertexID] * tileSize.xy;
  vec4 worldSpace = vec4(
    localSpace.x + u_pixelOffset.x + float(tilePos.x),
    localSpace.y - u_pixelOffset.y - float(tilePos.y),
    0.0,
    1.0
  );
  gl_Position = u_projection * u_view * worldSpace;

  vec3 textureSpace = u_textures[gl_VertexID] * texSize + texMapping;
  vec3 texNormSpace = textureSpace / u_texSpriteGraphicSize.xyz;
  v_texCoords = texNormSpace;
}
`;

const fragmentShader = `#version 300 es

in highp vec3 v_texCoords;
in highp float v_alpha;

out highp vec4 outputColor;

uniform highp sampler2DArray u_spriteGraphic;

void main(void) {
  outputColor = texture(u_spriteGraphic, v_texCoords);
}
`;

export class TilesProgram {
  public readonly glProgram: WebGLProgram;
  public readonly glVAO: WebGLVertexArrayObject;

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly tilesBuffer: DynamicDrawBuffer,
    public readonly tilesTexture: Texture2DArray,
    public readonly spriteIndicesTexture: Texture2DArray,
  ) {
    this.glProgram = createProgram(gl, vertexShader, fragmentShader);
    this.bind();
    this.glVAO = createVertexArray(gl);
    tilesBuffer.bind();
    tilePos.enableVertexAttribute(gl, this.glProgram);
    tileAlpha.enableVertexAttribute(gl, this.glProgram);
    gl.bindVertexArray(null);

    gl.uniformBlockBinding(this.glProgram, gl.getUniformBlockIndex(this.glProgram, "Primary"), 0);

    this.setTexture("u_spriteGraphic", tilesTexture.textureUnit);
    this.setTexture("u_spriteIndices", spriteIndicesTexture.textureUnit);
  }

  public setTexture(uniformName: string, textureUnit: number): void {
    const location = this.gl.getUniformLocation(this.glProgram, uniformName);
    assertNonNull(location, "cannot-get-uniform-location", { uniformName });
    this.gl.uniform1i(location, textureUnit);
  }

  public bind(): void {
    this.gl.useProgram(this.glProgram);
    this.gl.bindVertexArray(this.glVAO);
  }
}

export function provideTilesProgram(resolver: ServiceResolver) {
  return new TilesProgram(
    resolver.resolve(provideWebGL),
    resolver.resolve(provideTilesBuffer),
    resolver.resolve(provideTilesTexture2DArray),
    resolver.resolve(provideSpriteIndicesTexture),
  );
}
