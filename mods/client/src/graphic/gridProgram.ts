import { assertNonNull } from "../../../common/asserts.ts";
import { SPRITE_STRIDE_NORMALIZED } from "../../../core/vars.ts";
import { VertexAttribute } from "./attribute.ts";
import { vec,float } from "./types.ts";
import { createProgram, GL } from "./utilities.ts";

const vertPos = new VertexAttribute({ byteOffset: 0, location: 0, name: "vertPos", type: vec(2) });
const vertTex = new VertexAttribute({ byteOffset: 32, location: 1, name: "vertTex", type: vec(2) });

const byteStride = (2 * 4) + (2 * 4) + (3 * 4) + (1 * 4);
const tilePos = new VertexAttribute({ byteOffset: 0, byteStride, divisor: 1, location: 2, name: "tilePos", type: vec(2) });
const tileSize = new VertexAttribute({ byteOffset: 8, byteStride, divisor: 1, location: 3, name: "tileSize", type: vec(2) });
const tileTex = new VertexAttribute({ byteOffset: 16, byteStride, divisor: 1, location: 4, name: "tileTex", type: vec(3) });
const tileAlpha = new VertexAttribute({ byteOffset: 28, byteStride, divisor: 1, location: 5, name: "tileAlpha", type: float() });

const vertexShader = `#version 300 es

${vertPos.toShaderLine()}
${vertTex.toShaderLine()}
${tilePos.toShaderLine()}
${tileSize.toShaderLine()}
${tileTex.toShaderLine()}
${tileAlpha.toShaderLine()}

out vec3 v_texCoords;
out vec3 v_color;
out vec2 v_color2;
out float alpha;
flat out ivec2 texture4;

uniform instanced {
  mat4 worldMatrix;
  vec4 test[4092];
};

uniform mat4 u_Projection;

void main(void) {
    gl_Position = u_Projection * vec4(vertPos.xy * tileSize.xy + tilePos.xy, 0.0, 1.0);
    v_texCoords = tileTex + vec3(vertTex, 0.0);
    v_color = vec3(tilePos.xy, 1.0);
}

`;

const fragmentShader = `#version 300 es

in highp vec3 v_texCoords;
in highp vec3 v_color;
in highp vec2 v_color2;
in highp float alpha;
flat in highp ivec2 texture4;

out highp vec4 outputColor;

uniform sampler2D u_texture;

void main(void) {
  outputColor = vec4(texture(u_texture, v_texCoords.xy));
//   outputColor = vec4(1.0, 1.0, 1.0, 1.0);
//   outputColor = vec4(v_color, 1.0);
}
`;

export function initGridProgram(gl: GL): {
  glTilesBuffer: WebGLBuffer;
  glIndicesBuffer: WebGLBuffer;
  glPerVertexBuffer: WebGLBuffer;
  glProgram: WebGLProgram;
  glVAOGrid: WebGLVertexArrayObject;
} {
  const vertexCount = 4;
  const glProgram = createProgram(gl, vertexShader, fragmentShader);

  const glVAOGrid = gl.createVertexArray();
  assertNonNull(glVAOGrid, "cannot-create-vertex-array-object");
  gl.bindVertexArray(glVAOGrid);

  // Prepare vertex buffer
  const byteLength = (vertPos.type.byteLength + vertTex.type.byteLength) * vertexCount;
  const perVertexBuffer = new ArrayBuffer(byteLength);
  const glPerVertexBuffer = gl.createBuffer();
  assertNonNull(glPerVertexBuffer, "cannot-create-vertex-buffer");
  gl.bindBuffer(gl.ARRAY_BUFFER, glPerVertexBuffer);
  {
    const { byteOffset, type: { accessor, axes } } = vertPos
    const view = new accessor(perVertexBuffer, byteOffset, axes * vertexCount);
    view.set([0, 0, 1, 0, 1, 1, 0, 1]);
    vertPos.enableVertexAttribute(gl, glProgram);
  }
  {
    const { byteOffset, type: { accessor, axes } } = vertTex
    const view = new accessor(perVertexBuffer, byteOffset, axes * vertexCount);
    const s = SPRITE_STRIDE_NORMALIZED;
    view.set([0, 0, s, 0, s, s, 0, s]);
    vertTex.enableVertexAttribute(gl, glProgram);
  }
  console.log({perVertexBuffer});
  gl.bufferData(gl.ARRAY_BUFFER, perVertexBuffer, gl.STATIC_DRAW);

  // Prepare tile buffer
  const glTilesBuffer = gl.createBuffer();
  assertNonNull(glTilesBuffer, "cannot-create-tile-buffer");
  gl.bindBuffer(gl.ARRAY_BUFFER, glTilesBuffer);
  {
    tilePos.enableVertexAttribute(gl, glProgram);
    tileSize.enableVertexAttribute(gl, glProgram);
    tileTex.enableVertexAttribute(gl, glProgram);
    tileAlpha.enableVertexAttribute(gl, glProgram);
  }

  // Prepare indices buffer
  const glIndicesBuffer = gl.createBuffer();
  assertNonNull(glIndicesBuffer, "cannot-create-element-array-buffer");
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndicesBuffer);
  const indicesBuffer = new Uint8Array([0, 1, 2, 0, 2, 3]);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer, gl.STATIC_DRAW);

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
    glTilesBuffer,
    glIndicesBuffer,
    glPerVertexBuffer,
    glProgram,
    glVAOGrid,
  };
}
