import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { DynamicDrawBuffer } from "../DynamicDrawBuffer.ts";
import { webGLService } from "../WebGL.ts";
import { VertexAttribute } from "../attribute.ts";
import { float, vec } from "../types.ts";
import { createProgram, createVertexArray } from "../utilities.ts";
import { tilesBufferService } from "./tilesBuffer.ts";

const byteStride = (2 * 4) + (2 * 4) + (3 * 4) + (1 * 4);
const tilePos = new VertexAttribute({ byteOffset: 0, byteStride, divisor: 1, location: 0, name: "tilePos", type: vec(2) });
const tileSize = new VertexAttribute({ byteOffset: 8, byteStride, divisor: 1, location: 1, name: "tileSize", type: vec(2) });
const tileTex = new VertexAttribute({ byteOffset: 16, byteStride, divisor: 1, location: 2, name: "tileTex", type: vec(3) });
const tileAlpha = new VertexAttribute({ byteOffset: 28, byteStride, divisor: 1, location: 3, name: "tileAlpha", type: float() });

const vertexShader = `#version 300 es

${tilePos.toShaderLine()}
${tileSize.toShaderLine()}
${tileTex.toShaderLine()}
${tileAlpha.toShaderLine()}

out vec3 v_texCoords;
out float v_alpha;

const vec2 vertices[6] = vec2[6](
  vec2(0.0, 0.0),
  vec2(0.0, -1.0),
  vec2(1.0, -1.0),

  vec2(0.0, 0.0),
  vec2(1.0, -1.0),
  vec2(1.0, 0.0)
);

const vec2 textures[6] = vec2[6](
  vec2(0.0, 1.0),
  vec2(0.0, 0.0),
  vec2(1.0, 0.0),

  vec2(0.0, 1.0),
  vec2(1.0, 0.0),
  vec2(1.0, 1.0)
);

uniform Primary {
  uniform mat4 u_Projection;
  uniform mat4 u_View;
};

float TEXTURE_SIZE = 1024.0;

void main(void) {
  vec2 localSpace = vertices[gl_VertexID] * tileSize.xy;
  vec2 worldSpace = vec2(localSpace.x + tilePos.x, localSpace.y - tilePos.y);
  vec2 texelSpace = textures[gl_VertexID] * tileSize.xy + tileTex.xy;
  vec2 textureUVN = texelSpace.xy / TEXTURE_SIZE;
  gl_Position = u_Projection * u_View * vec4(worldSpace.x, worldSpace.y, 0.0, 1.0);
  v_texCoords = vec3(textureUVN.xy, tileTex.z);
  v_alpha = tileAlpha;
}
`;

const fragmentShader = `#version 300 es

in highp vec3 v_texCoords;
in highp float v_alpha;

out highp vec4 outputColor;

uniform highp sampler2DArray u_texture;

void main(void) {
  outputColor = texture(u_texture, vec3(v_texCoords.xy, 0.0));
}
`;

export class TilesProgram {
  public readonly glProgram: WebGLProgram;
  public readonly glVAO: WebGLVertexArrayObject;

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly tilesBuffer: DynamicDrawBuffer,
  ) {
    this.glProgram = createProgram(gl, vertexShader, fragmentShader);
    this.glVAO = createVertexArray(gl);
    tilesBuffer.bind();
    tilePos.enableVertexAttribute(gl, this.glProgram);
    tileSize.enableVertexAttribute(gl, this.glProgram);
    tileTex.enableVertexAttribute(gl, this.glProgram);
    tileAlpha.enableVertexAttribute(gl, this.glProgram);
    gl.bindVertexArray(null);

    gl.uniformBlockBinding(this.glProgram, gl.getUniformBlockIndex(this.glProgram, "Primary"), 0);
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
    );
  },
});
