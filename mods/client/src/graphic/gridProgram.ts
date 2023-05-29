import { assertNonNull } from "../../../common/asserts.ts";
import { SPRITE_STRIDE_NORMALIZED, SPRITES_COUNT_PER_AXIS } from "../vars.ts";
import { toShaderLine, VertexAttribute } from "./attribute.ts";
import { createProgram, GL, initVertexAttribute } from "./utilities.ts";

const vertexPosition: VertexAttribute = {
  accessor: Float32Array,
  axes: 2,
  byteSize: 4,
  divisor: 0,
  glType: WebGL2RenderingContext.FLOAT,
  isInteger: false,
  isSigned: false,
  location: 0,
  name: "a_vertexPosition",
  normalize: false,
  shaderType: "vec2",
  totalByteSize: 8,
};

const vertexTextureCoords: VertexAttribute = {
  accessor: Float32Array,
  axes: 2,
  byteSize: 4,
  divisor: 0,
  glType: WebGL2RenderingContext.FLOAT,
  isInteger: false,
  isSigned: false,
  location: 1,
  name: "a_vertexTextureCoords",
  normalize: false,
  shaderType: "vec2",
  totalByteSize: 8,
};

const blockPosition: VertexAttribute = {
  accessor: Uint8Array,
  axes: 2,
  byteSize: 1,
  divisor: 1,
  glType: WebGL2RenderingContext.UNSIGNED_BYTE,
  isInteger: true,
  isSigned: false,
  location: 2,
  name: "a_blockPosition",
  normalize: false,
  shaderType: "uvec2",
  totalByteSize: 2,
};

const blockTextureIndex: VertexAttribute = {
  accessor: Uint16Array,
  axes: 1,
  byteSize: 2,
  divisor: 1,
  glType: WebGL2RenderingContext.UNSIGNED_SHORT,
  isInteger: true,
  isSigned: false,
  location: 3,
  name: "a_blockTextureIndex",
  normalize: false,
  shaderType: "uint",
  totalByteSize: 2,
};

const blockTextureAtlas: VertexAttribute = {
  accessor: Uint8Array,
  axes: 1,
  byteSize: 1,
  divisor: 1,
  glType: WebGL2RenderingContext.UNSIGNED_BYTE,
  isInteger: true,
  isSigned: false,
  location: 4,
  name: "a_blockTextureAtlas",
  normalize: false,
  shaderType: "uint",
  totalByteSize: 1,
};

const vertexShader = `#version 300 es

${toShaderLine(vertexPosition)}
${toShaderLine(vertexTextureCoords)}
${toShaderLine(blockPosition)}
${toShaderLine(blockTextureIndex)}

out vec2 v_texCoords;
out vec2 v_color;
out vec2 v_color2;
flat out ivec2 texture4;

struct PerTile {
  ivec4 position;
  ivec4 textures;
};

uniform instanced {
  PerTile test[10];
};

uniform mat4 u_Projection;

uint SPRITES_COUNT_PER_AXIS = uint(${SPRITES_COUNT_PER_AXIS});
float SPRITE_STRIDE_NORMALIZED = ${SPRITE_STRIDE_NORMALIZED};

vec2 calcTextureCoords() {
  uint col = a_blockTextureIndex % SPRITES_COUNT_PER_AXIS;
  uint row = a_blockTextureIndex / SPRITES_COUNT_PER_AXIS;
  return vec2(
    a_vertexTextureCoords.x + SPRITE_STRIDE_NORMALIZED * float(col),
    a_vertexTextureCoords.y + SPRITE_STRIDE_NORMALIZED * float(row)
  );
}

void main(void) {
    gl_Position = u_Projection * vec4(a_vertexPosition * 32.0 + float(gl_InstanceID) * 32.0, 0.0, 1.0);
    v_texCoords = calcTextureCoords();
    v_color = calcTextureCoords();
    v_color2 = vec2(float(a_blockPosition), 0.0);
}

`;

const fragmentShader = `#version 300 es

in highp vec2 v_texCoords;
in highp vec2 v_color;
in highp vec2 v_color2;
flat in highp ivec2 texture4;

out highp vec4 outputColor;

uniform sampler2D u_texture;

void main(void) {
  outputColor = vec4(texture(u_texture, v_texCoords).xyz, 1.0);
//   outputColor = vec4(v_color, 0.0, 1.0);
}
`;

export function initGridProgram(gl: GL): {
  glBlockBuffer: WebGLBuffer;
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

  const perVertexBuffer = new ArrayBuffer(
    (vertexPosition.totalByteSize + vertexTextureCoords.totalByteSize) * vertexCount,
  );
  const positionAccessor = new vertexPosition.accessor(
    perVertexBuffer,
    0,
    vertexPosition.axes * vertexCount,
  );
  positionAccessor.set([0, 0, 1, 0, 1, 1, 0, 1]);

  const textureCoordsOffset = vertexPosition.totalByteSize * vertexCount;
  const textureAccessor = new vertexTextureCoords.accessor(
    perVertexBuffer,
    textureCoordsOffset,
    vertexTextureCoords.axes * vertexCount,
  );
  textureAccessor.set([
    0,
    0,
    SPRITE_STRIDE_NORMALIZED,
    0,
    SPRITE_STRIDE_NORMALIZED,
    SPRITE_STRIDE_NORMALIZED,
    0,
    SPRITE_STRIDE_NORMALIZED,
  ]);

  const glPerVertexBuffer = gl.createBuffer();
  assertNonNull(glPerVertexBuffer, "cannot-create-vertex-buffer");
  gl.bindBuffer(gl.ARRAY_BUFFER, glPerVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, perVertexBuffer, gl.STATIC_DRAW);

  initVertexAttribute({
    byteOffset: 0,
    byteStride: 0,
    gl,
    glProgram,
    vertexAttribute: vertexPosition,
  });
  initVertexAttribute({
    byteOffset: textureCoordsOffset,
    byteStride: 0,
    gl,
    glProgram,
    vertexAttribute: vertexTextureCoords,
  });

  const buffer = new ArrayBuffer(16);

  const dv = new DataView(buffer);
  let n = 0;
  dv.setUint8(n + 0, 0);
  dv.setUint8(n + 1, 0);
  dv.setUint16(n + 2, 1, true);
  n += 4;

  dv.setUint8(n + 0, 1);
  dv.setUint8(n + 1, 1);
  dv.setUint16(n + 2, 2, true);
  n += 4;

  dv.setUint8(n + 0, 2);
  dv.setUint8(n + 1, 2);
  dv.setUint16(n + 2, 3, true);
  n += 4;

  dv.setUint8(n + 0, 3);
  dv.setUint8(n + 1, 3);
  dv.setUint16(n + 2, 4, true);
  n += 4;

  const glBlockBuffer = gl.createBuffer();
  assertNonNull(glBlockBuffer, "cannot-create-block-buffer");
  gl.bindBuffer(gl.ARRAY_BUFFER, glBlockBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);

  const totalByteStride = blockPosition.totalByteSize + blockTextureIndex.totalByteSize;
  initVertexAttribute({
    byteOffset: 0,
    byteStride: totalByteStride,
    gl,
    glProgram,
    vertexAttribute: blockPosition,
  });
  initVertexAttribute({
    byteOffset: blockPosition.totalByteSize,
    byteStride: totalByteStride,
    gl,
    glProgram,
    vertexAttribute: blockTextureIndex,
  });

  const indicesBuffer = new Uint8Array([0, 1, 2, 0, 2, 3]);
  const glIndicesBuffer = gl.createBuffer();
  assertNonNull(glIndicesBuffer, "cannot-create-element-array-buffer");
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer, gl.STATIC_DRAW);

  gl.bindVertexArray(null);


  gl.uniformBlockBinding(
    glProgram,
    gl.getUniformBlockIndex(glProgram, 'instanced'),
    0
  );
  const redMatUniformBlockBuffer = gl.createBuffer();
  gl.bindBuffer(gl.UNIFORM_BUFFER, redMatUniformBlockBuffer);
  gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(80).fill(1.0), gl.STATIC_DRAW);

  gl.bindBufferBase(
    gl.UNIFORM_BUFFER,
    0,
    redMatUniformBlockBuffer
  );

  return {
    glBlockBuffer,
    glIndicesBuffer,
    glPerVertexBuffer,
    glProgram,
    glVAOGrid,
  };
}
