import { assertNonNull } from "../../../common/asserts.ts";
import { TILES_PER_TEXTURE, TILES_PER_TEXTURE_AXIS, TILE_STRIDE_NORMALIZED } from "../vars.ts";
import { attribute, toShaderLine } from "./attribute.ts";
import { createProgram, GL, initVertexAttribute } from "./utilities.ts";

const vertexPosition = attribute("0:v2f4:a_vertexPosition:0");
const vertexTextureCoords = attribute("1:v2f4:a_vertexTextureCoords:0");
const tilePosition = attribute("2:v2f4:a_tilePosition:1");
const tileTextureIndex = attribute("3:si4:a_tileTextureIndex:1");
const tileTextureAtlas = attribute("4:su4:a_tileTextureAtlas:1");
const tileAlpha = attribute("5:sf4:a_tileAlpha:1");

const vertexShader = `#version 300 es

${toShaderLine(vertexPosition)}
${toShaderLine(vertexTextureCoords)}
${toShaderLine(tilePosition)}
${toShaderLine(tileTextureIndex)}
${toShaderLine(tileAlpha)}

out vec3 v_texCoords;
out vec3 v_color;
out vec2 v_color2;
out float alpha;
flat out ivec2 texture4;

struct PerTile {
  ivec4 position;
  ivec4 textures;
};

uniform instanced {
  PerTile test[10];
};

uniform mat4 u_Projection;

float TILE_STRIDE_NORMALIZED = ${TILE_STRIDE_NORMALIZED};

int TILES_PER_TEXTURE = ${TILES_PER_TEXTURE};
int TILES_PER_TEXTURE_AXIS = ${TILES_PER_TEXTURE_AXIS};

vec3 getTileTextureCoords(int index) {
//   float z = float(index >> 10);
//   float y = float(index % 1024 >> 5) * TILE_STRIDE_NORMALIZED;
//   float x = float(index % 32) * TILE_STRIDE_NORMALIZED;

  float z = float(index / TILES_PER_TEXTURE);
  float y = float((index % TILES_PER_TEXTURE) / TILES_PER_TEXTURE_AXIS) * TILE_STRIDE_NORMALIZED;
  float x = float(index % TILES_PER_TEXTURE_AXIS) * TILE_STRIDE_NORMALIZED;
  return vec3(x, y, z);
}

void main(void) {
    gl_Position = u_Projection * vec4(a_vertexPosition * 32.0 + a_tilePosition, 0.0, 1.0);
    // gl_Position = u_Projection * vec4(a_vertexPosition * 32.0 + float(gl_InstanceID) * 32.0, 0.0, 1.0);
    v_texCoords = vec3(a_vertexTextureCoords, 0.0) + getTileTextureCoords(a_tileTextureIndex);
    v_color = vec3(1.0, 1.0, 0.0);
    v_color2 = vec2(float(a_tilePosition.x), 0.0);
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
//   outputColor = vec4(v_texCoords, 1.0);
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
    TILE_STRIDE_NORMALIZED,
    0,
    TILE_STRIDE_NORMALIZED,
    TILE_STRIDE_NORMALIZED,
    0,
    TILE_STRIDE_NORMALIZED,
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

  const glTilesBuffer = gl.createBuffer();
  assertNonNull(glTilesBuffer, "cannot-create-tile-buffer");
  gl.bindBuffer(gl.ARRAY_BUFFER, glTilesBuffer);

  const totalByteStride = tilePosition.totalByteSize + tileTextureIndex.totalByteSize + tileAlpha.totalByteSize;
  initVertexAttribute({
    byteOffset: 0,
    byteStride: totalByteStride,
    gl,
    glProgram,
    vertexAttribute: tilePosition,
  });
  initVertexAttribute({
    byteOffset: tilePosition.totalByteSize,
    byteStride: totalByteStride,
    gl,
    glProgram,
    vertexAttribute: tileTextureIndex,
  });
  initVertexAttribute({
    byteOffset: tilePosition.totalByteSize + tileTextureAtlas.totalByteSize,
    byteStride: totalByteStride,
    gl,
    glProgram,
    vertexAttribute: tileAlpha,
  });

  const indicesBuffer = new Uint8Array([0, 1, 2, 0, 2, 3]);
  const glIndicesBuffer = gl.createBuffer();
  assertNonNull(glIndicesBuffer, "cannot-create-element-array-buffer");
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer, gl.STATIC_DRAW);

  gl.bindVertexArray(null);

  gl.uniformBlockBinding(
    glProgram,
    gl.getUniformBlockIndex(glProgram, "instanced"),
    0,
  );
  const redMatUniformBlockBuffer = gl.createBuffer();
  gl.bindBuffer(gl.UNIFORM_BUFFER, redMatUniformBlockBuffer);
  gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(80).fill(1.0), gl.STATIC_DRAW);

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
