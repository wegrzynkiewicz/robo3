import { assertNonNull, assertObject } from "../common/asserts.ts";
import { processMap } from "../tiled-map/types.ts";
import { initGridProgram } from "./src/graphic/gridProgram.ts";
import { ortho } from "./src/graphic/math.ts";
import { coords2index } from "./src/graphic/texture.ts";
import { getUniformBlocksInfo, getUniformInfo } from "./src/graphic/utilities.ts";
import { TILE_STRIDE_NORMALIZED } from "./src/vars.ts";

document.addEventListener("DOMContentLoaded", () => {
});
const canvas = document.getElementById("primary-canvas") as HTMLCanvasElement;
assertNonNull(canvas, "cannot-find-primary-canvas");

const gl = canvas.getContext("webgl2", {
  premultipliedAlpha: true, // Ask for non-premultiplied alpha
  alpha: false,
})!;

gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

const texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, texture);
const img = new Image();
let updateTexture = () => {};
const onLoadedImage = function () {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //   const ab2 = new Uint8Array(512 * 512 * 4);
  //   for (let i = 0; i < 512 * 512 * 4; i++) {
  //     ab2[i] = Math.random() * 256;
  //   }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, ab2);
  gl.generateMipmap(gl.TEXTURE_2D);
};
img.addEventListener("load", () => {
//   onLoadedImage();
  //   updateTexture = onLoadedImage;
});
img.src = "./assets/1.png";


processMap().then((imageData) => {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
  gl.generateMipmap(gl.TEXTURE_2D);
}) ;

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
}

const nearestSampler = gl.createSampler();
assertNonNull(nearestSampler, "cannot-create-nearest-sampler");
gl.samplerParameteri(nearestSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.bindSampler(0, nearestSampler);

const ab = new ArrayBuffer(20 * 8024);
const ta = new Float32Array(ab);
const ia = new Int32Array(ab);

const { glProgram, glVAOGrid, glTilesBuffer } = initGridProgram(gl);
function load() {
  let n = 0;
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      ta[n + 0] = x * 32.0;
      ta[n + 1] = y * 32.0;
    //   ia[n + 2] = coords2index(1, 7, 0);
      ia[n + 2] = 40;
      ta[n + 3] = 1;
      n += 4;
    }
  }

  for (let y = 2; y < 6; y++) {
    for (let x = 2; x < 6; x++) {
      ta[n + 0] = x * 32.0;
      ta[n + 1] = y * 32.0;
      ia[n + 2] = coords2index(4, 7, 0);
      ta[n + 3] = 1;
      n += 4;
    }
  }

  const sy = 2, ey = 6, sx = 10, ex = 14;
  for (let y = sy; y <= ey; y++) {
    for (let x = sx; x <= ex; x++) {
      ta[n + 0] = x * 32.0;
      ta[n + 1] = y * 32.0;
      ia[n + 2] = 56;
      ta[n + 3] = 1;
      n += 4;
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, glTilesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, ab, gl.DYNAMIC_DRAW);
}

console.log({ ab });

load();
gl.useProgram(glProgram);
const projectionLoc1 = gl.getUniformLocation(glProgram, "u_Projection");
const textureLoc1 = gl.getUniformLocation(glProgram, "u_texture");
console.log(getUniformBlocksInfo(gl, glProgram));
console.log(getUniformInfo(gl, glProgram));
gl.bindVertexArray(glVAOGrid);

const projection = new Float32Array(16);
gl.uniformMatrix4fv(projectionLoc1, false, projection);
gl.uniform1i(textureLoc1, 0);
// gl.uniform1ui(toLoc, 50);
gl.clearColor(1.0, 0.0, 1.0, 1.0);
gl.enable(gl.BLEND);

const datas: [string, number][] = [
  ["ZERO", gl.ZERO],
  ["ONE", gl.ONE],
  ["SRC_COLOR", gl.SRC_COLOR],
  ["ONE_MINUS_SRC_COLOR", gl.ONE_MINUS_SRC_COLOR],
  ["DST_COLOR", gl.DST_COLOR],
  ["ONE_MINUS_DST_COLOR", gl.ONE_MINUS_DST_COLOR],
  ["SRC_ALPHA", gl.SRC_ALPHA],
  ["ONE_MINUS_SRC_ALPHA", gl.ONE_MINUS_SRC_ALPHA],
  ["DST_ALPHA", gl.DST_ALPHA],
  ["ONE_MINUS_DST_ALPHA", gl.ONE_MINUS_DST_ALPHA],
  ["CONSTANT_COLOR", gl.CONSTANT_COLOR],
  ["ONE_MINUS_CONSTANT_COLOR", gl.ONE_MINUS_CONSTANT_COLOR],
  ["CONSTANT_ALPHA", gl.CONSTANT_ALPHA],
  ["ONE_MINUS_CONSTANT_ALPHA", gl.ONE_MINUS_CONSTANT_ALPHA],
  ["SRC_ALPHA_SATURATE", gl.SRC_ALPHA_SATURATE],
];

let sb = 0;
let eb = 0;
document.addEventListener("keypress", (event) => {
  if (event.key === "q") {
    sb += 1;
  }
  if (event.key === "z") {
    sb -= 1;
  }
  if (event.key === "e") {
    eb += 1;
  }
  if (event.key === "c") {
    eb -= 1;
  }
  console.log(datas[sb][0], "----", datas[eb][0]);
  gl.blendFunc(datas[sb][1], datas[eb][1]);
});

gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const fpsElem = document.querySelector("#fps")!;

const count = 2 ** 16;
const ab1 = new ArrayBuffer(count);
console.log(count);
console.log(ab1);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ortho(projection, 0, canvas.width / 2, 0, canvas.height / 2, -10, 10);
  gl.uniformMatrix4fv(projectionLoc1, false, projection);
  gl.viewport(20, 20, canvas.width, canvas.height);
  console.log(canvas.width, "x", canvas.height);
}
// resize the canvas to fill browser window dynamically
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let then = 0;
function drawScene(now: number) {
  now *= 0.001; // convert to seconds
  const deltaTime = now - then; // compute time since last frame
  then = now; // remember time for next frame
  const fps = 1 / deltaTime; // compute frames per second
  //   fpsElem.textContent = fps.toFixed(1);  // update fps display
  //   load();
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, 560);
  updateTexture();
  requestAnimationFrame(drawScene);
}

drawScene(0);
