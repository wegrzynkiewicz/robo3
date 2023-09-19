import { assertNonNull } from "../../../common/asserts.ts";
import { VertexAttribute } from "./attribute.ts";
import { float, vec } from "./types.ts";
import { createProgram, GL } from "./utilities.ts";

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
flat out float v_alpha;

uniform instanced {
  mat4 worldMatrix;
  vec4 test[4092];
};

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

float TEXTURE_SIZE = 1024.0;

uniform mat4 u_Projection;
uniform mat4 u_View;

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

uniform sampler2D u_texture;

void main(void) {
  outputColor = vec4(texture(u_texture, v_texCoords.xy));
}
`;


const { ARRAY_BUFFER, DYNAMIC_DRAW } = WebGL2RenderingContext;

export class DynamicDrawBuffer {
  public typedArray: Float32Array;
  public dataView: DataView;
  protected readonly arrayBuffer: ArrayBuffer;
  protected readonly glBuffer: WebGLBuffer;

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly byteLength: number,
  ) {
    const glBuffer = this.gl.createBuffer()!;
    assertNonNull(glBuffer, "cannot-create-buffer");
    this.glBuffer = glBuffer;
    this.gl.bindBuffer(ARRAY_BUFFER, this.glBuffer);
    this.gl.bufferData(ARRAY_BUFFER, this.byteLength, DYNAMIC_DRAW);
    this.arrayBuffer = new ArrayBuffer(this.byteLength);
    this.dataView = new DataView(this.arrayBuffer);
    this.typedArray = new Float32Array(this.arrayBuffer);
  }

  public bind() {
    this.gl.bindBuffer(ARRAY_BUFFER, this.glBuffer);
  }

  public update(byteLength: number) {
    this.gl.bindBuffer(ARRAY_BUFFER, this.glBuffer);
    this.gl.bufferSubData(ARRAY_BUFFER, 0, this.dataView, 0, byteLength);
  }
}

export function initGridProgram(gl: GL): {
  tilesBuffer: DynamicDrawBuffer;
  glProgram: WebGLProgram;
  glVAOGrid: WebGLVertexArrayObject;
} {
  const glProgram = createProgram(gl, vertexShader, fragmentShader);

  const glVAOGrid = gl.createVertexArray();
  assertNonNull(glVAOGrid, "cannot-create-vertex-array-object");
  gl.bindVertexArray(glVAOGrid);

  // Prepare tile buffer
  const tilesBuffer = new DynamicDrawBuffer(gl, 65536);
  tilePos.enableVertexAttribute(gl, glProgram);
  tileSize.enableVertexAttribute(gl, glProgram);
  tileTex.enableVertexAttribute(gl, glProgram);
  tileAlpha.enableVertexAttribute(gl, glProgram);

  gl.bindVertexArray(null);

  gl.uniformBlockBinding(
    glProgram,
    gl.getUniformBlockIndex(glProgram, "instanced"),
    0,
  );
  const redMatUniformBlockBuffer = gl.createBuffer();
  gl.bindBuffer(gl.UNIFORM_BUFFER, redMatUniformBlockBuffer);
  gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(8 * 2048).fill(1.0), gl.STATIC_DRAW);

  gl.bindBufferBase(
    gl.UNIFORM_BUFFER,
    0,
    redMatUniformBlockBuffer,
  );

  return {
    tilesBuffer,
    glProgram,
    glVAOGrid,
  };
}
