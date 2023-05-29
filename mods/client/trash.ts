import { initGridProgram } from "./src/graphic/gridProgram.ts";
import { ortho } from "./src/graphic/math.ts";
import {
  createProgram,
  getUniformBlocksInfo,
  getUniformInfo,
  GL,
} from "./src/graphic/utilities.ts";

document.addEventListener("DOMContentLoaded", () => {
});

"use strict";

const canvas = document.querySelector("canvas")!;
const gl = canvas.getContext("webgl2", {
  premultipliedAlpha: false, // Ask for non-premultiplied alpha
})!;

const TEXTURE_SIZE = 512;
const SPRITE_SIZE = 32;
const SPRITES_COUNT_PER_AXIS = TEXTURE_SIZE / SPRITE_SIZE;
const SPRITE_STRIDE_NORMALIZED = SPRITE_SIZE / TEXTURE_SIZE;

const vertexShader = `#version 300 es

layout(location=0) in lowp vec2 position;
layout(location=1) in lowp float color;
layout(location=2) in lowp vec2 texture;
layout(location=3) in lowp uint index2;
layout(location=4) in lowp float worldPosition;

out lowp vec4 v_color;
out lowp vec2 v_texCoords;

uniform mat4 projection;
uniform uint index;

uint spritePerRow = uint(${SPRITES_COUNT_PER_AXIS});
float spriteStrideNormalized = ${SPRITE_STRIDE_NORMALIZED};

vec2 getValueByIndexFromTexture(vec2 texCoords, uint spriteIndex) {
  uint col = spriteIndex % spritePerRow;
  uint row = spriteIndex / spritePerRow;
  return vec2(
    texCoords.x + spriteStrideNormalized * float(col),
    texCoords.y + spriteStrideNormalized * float(row)
  );
}

void main(void) {
    gl_Position = projection* vec4(position * 32.0 + worldPosition * 24.0, 0.0, 1.0);
    v_color = vec4(worldPosition, 0.0, 0.0, 1.0);
    v_texCoords = getValueByIndexFromTexture(texture, index2);
}
`;

const fragmentShader = `#version 300 es

in lowp vec4 v_color;
in lowp vec2 v_texCoords;

out lowp vec4 outputColor;

uniform sampler2D u_texture;

void main(void) {
  outputColor = vec4(texture(u_texture, v_texCoords).xyz, 0.7);
}
`;

const program = createProgram(gl, vertexShader, fragmentShader);

const positionLoc = gl.getAttribLocation(program, "position");
const colorLoc = gl.getAttribLocation(program, "color");
const textureLoc = gl.getAttribLocation(program, "texture");
const index2 = gl.getAttribLocation(program, "index2");
const worldPosition = gl.getAttribLocation(program, "worldPosition");
console.log({ positionLoc, colorLoc, textureLoc, index2, worldPosition });

const projectionLoc = gl.getUniformLocation(program, "u_Projection");
const u_texture = gl.getUniformLocation(program, "u_texture");
const toLoc = gl.getUniformLocation(program, "index");

console.log(getUniformBlocksInfo(gl, program));
console.log(getUniformInfo(gl, program));

const triangleVAO = gl.createVertexArray();
gl.bindVertexArray(triangleVAO);

const FLOAT32_BYTES = 4;
const POS_VECTOR_AXIS = 2;
const VERTICES_COUNT = 4;
const POS_VERTEX_BYTES = FLOAT32_BYTES * POS_VECTOR_AXIS * VERTICES_COUNT;
const TEX_VERTEX_BYTES = FLOAT32_BYTES * POS_VECTOR_AXIS * VERTICES_COUNT;
const COLOR_VERTEX_BYTES = FLOAT32_BYTES * 1 * VERTICES_COUNT;
const VERTEX_BUFFER_BYTES = POS_VERTEX_BYTES + COLOR_VERTEX_BYTES + TEX_VERTEX_BYTES;
const vertexBuffer = new ArrayBuffer(VERTEX_BUFFER_BYTES);

// in clip space
const vertexPositions = new Float32Array(vertexBuffer, 0, 8);
vertexPositions.set([
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  1,
]);

const colorPositions = new Float32Array(vertexBuffer, POS_VERTEX_BYTES, 4);
colorPositions.set([
  1,
  0.7,
  0.4,
  0.0,
]);

const textureBuffer = new Float32Array(vertexBuffer, POS_VERTEX_BYTES + COLOR_VERTEX_BYTES, 8);
textureBuffer.set([
  0,
  0,
  SPRITE_STRIDE_NORMALIZED,
  0,
  SPRITE_STRIDE_NORMALIZED,
  SPRITE_STRIDE_NORMALIZED,
  0,
  SPRITE_STRIDE_NORMALIZED,
]);

console.log(textureBuffer);

const indicesBuffer = new Uint8Array([0, 1, 2, 0, 2, 3]);
const indicesGLBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesGLBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer, gl.STATIC_DRAW);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexBuffer, gl.STATIC_DRAW);

gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(
  positionLoc,
  2, // 2 values per vertex shader iteration
  gl.FLOAT, // data is 32bit floats
  false, // don't normalize
  0, // stride (0 = auto)
  0, // offset into buffer
);

gl.enableVertexAttribArray(colorLoc);
gl.vertexAttribPointer(
  colorLoc,
  1, // 2 values per vertex shader iteration
  gl.FLOAT, // data is 32bit floats
  false, // don't normalize
  0, // stride (0 = auto)
  POS_VERTEX_BYTES, // offset into buffer
);

gl.enableVertexAttribArray(textureLoc);
gl.vertexAttribPointer(
  textureLoc,
  2, // 2 values per vertex shader iteration
  gl.FLOAT, // data is 32bit floats
  false, // don't normalize
  0, // stride (0 = auto)
  POS_VERTEX_BYTES + COLOR_VERTEX_BYTES, // offset into buffer
);

const arrayBuffer = new ArrayBuffer(80);
const worldPositionBuffer = new Float32Array(arrayBuffer, 0, 5);
const index2Buffer = new Uint16Array(arrayBuffer, 20, 5);
const indexGLBuffer = gl.createBuffer();

worldPositionBuffer.set([
  0,
  1,
  2,
  3,
  4,
]);

index2Buffer.set([
  0,
  1,
  2,
  3,
  4,
]);

gl.bindBuffer(gl.ARRAY_BUFFER, indexGLBuffer);
gl.bufferData(gl.ARRAY_BUFFER, arrayBuffer, gl.STATIC_DRAW);

gl.enableVertexAttribArray(index2);
gl.vertexAttribIPointer(
  index2,
  1, // 2 values per vertex shader iteration
  gl.UNSIGNED_SHORT, // data is 32bit floats
  0, // stride (0 = auto)
  20, // offset into buffer
);
gl.vertexAttribDivisor(index2, 1);

gl.enableVertexAttribArray(worldPosition);
gl.vertexAttribPointer(
  worldPosition,
  1, // 2 values per vertex shader iteration
  gl.FLOAT, // data is 32bit floats
  false, // don't normalize
  4, // stride (0 = auto)
  0, // offset into buffer
);
gl.vertexAttribDivisor(worldPosition, 1);

gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

const texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, texture);
const img = new Image();
img.addEventListener("load", function () {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
});
img.src = "2.png";

{
  const level = 0;
  const internalFormat = gl.R8;
  const width = 3;
  const height = 2;
  const border = 0;
  const format = gl.RED;
  const type = gl.UNSIGNED_BYTE;
  const data = new Uint8Array([
    128,
    64,
    128,
    0,
    192,
    0,
  ]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

const projection = new Float32Array(16);
ortho(projection, 0, 640 / 2, 0, 480 / 2, -10, 10);


const { glProgram, glVAOGrid } = initGridProgram(gl);
gl.useProgram(glProgram);
const projectionLoc1 = gl.getUniformLocation(glProgram, "u_Projection");
const textureLoc1 = gl.getUniformLocation(program, "u_texture");
gl.bindVertexArray(glVAOGrid);

let width = 640;
let height = 480; 
document.addEventListener('mousemove', (event) => {
  width += event.movementX;
  height += event.movementY;
  ortho(projection, 0, width, 0, height, -10, 10);
  gl.uniformMatrix4fv(projectionLoc1, false, projection);
})

gl.uniformMatrix4fv(projectionLoc1, false, projection);
gl.uniform1i(textureLoc1, 0);
// gl.uniform1ui(toLoc, 50);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, 4);
  requestAnimationFrame(drawScene);
}

drawScene();
