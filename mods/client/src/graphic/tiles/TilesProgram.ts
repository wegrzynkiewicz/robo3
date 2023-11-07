import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { webGLService } from "../WebGL.ts";
import { VertexAttribute } from "../attribute.ts";
import { Texture2DArray } from "../textures/Texture2DArray.ts";
import { i32, ivec } from "../types.ts";
import { createProgram, createVertexArray } from "../utilities.ts";
import { tilesTexture2DArrayService } from "./TilesTexture2DArray.ts";
import { tilesBufferService } from "./tilesBuffer.ts";
import { assertNonNull } from "../../../../common/asserts.ts";
import { spriteIndicesTextureService } from "./SpriteIndicesTexture.ts";

const byteStride = (2 * 2) + (1 * 4);
const tilePos = new VertexAttribute({ byteOffset: 0, byteStride, divisor: 1, location: 0, name: "tilePosE", type: ivec(2, "i16") });
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

const vec2 vertices[6] = vec2[6](
  vec2(0.0, 0.0),
  vec2(0.0, -1.0),
  vec2(1.0, -1.0),

  vec2(0.0, 0.0),
  vec2(1.0, -1.0),
  vec2(1.0, 0.0)
);

const vec2 textures[6] = vec2[6](
  vec2(0.0, 0.0),
  vec2(0.0, 1.0),
  vec2(1.0, 1.0),

  vec2(0.0, 0.0),
  vec2(1.0, 1.0),
  vec2(1.0, 0.0)
);

uniform Primary {
  uniform mat4 u_Projection;
  uniform mat4 u_View;
};

uniform highp sampler2DArray spriteIndices;

float TEXTURE_SIZE = 1024.0;

void main(void) {

  vec2 tilePos = vec2(float(tilePosE.x), float(tilePosE.y));

  int y = tileAlpha / 256;
  int x = tileAlpha % 256;
  vec4 layer1 = texelFetch(spriteIndices, ivec3(x - 1, y, 0), 0);
  vec4 layer2 = texelFetch(spriteIndices, ivec3(x - 1, y, 1), 0);

  vec3 texMapping = layer1.xyz;
  vec2 texSize    = layer2.xy;
  vec2 tileSize   = layer2.zw;

  vec2 localSpace = vertices[gl_VertexID] * tileSize.xy;
  vec2 worldSpace = vec2(localSpace.x + tilePos.x, localSpace.y - tilePos.y);
  vec2 texelSpace = textures[gl_VertexID] * texSize.xy + texMapping.xy;
  vec2 textureUVN = texelSpace.xy / TEXTURE_SIZE;

  gl_Position = u_Projection * u_View * vec4(worldSpace.x, worldSpace.y, 0.0, 1.0);
  v_texCoords = vec3(textureUVN.xy, texMapping.z);
  v_alpha = float(tilePos.x);
}
`;

const fragmentShader = `#version 300 es

in highp vec3 v_texCoords;
in highp float v_alpha;

out highp vec4 outputColor;

uniform highp sampler2DArray textures;

void main(void) {
  outputColor = texture(textures, v_texCoords);
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

    this.setTexture('textures', tilesTexture.textureUnit);
    this.setTexture('spriteIndices', spriteIndicesTexture.textureUnit);
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

export const tilesProgramService = registerService({
  async provider(resolver: ServiceResolver): Promise<TilesProgram> {
    return new TilesProgram(
      await resolver.resolve(webGLService),
      await resolver.resolve(tilesBufferService),
      await resolver.resolve(tilesTexture2DArrayService),
      await resolver.resolve(spriteIndicesTextureService),
    );
  },
});

function uint(): import("../types.ts").VertexAttributeType {
  throw new Error("Function not implemented.");
}
