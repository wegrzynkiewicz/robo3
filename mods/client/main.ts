import { assertNonNull } from "../common/asserts.ts";
import { TILES_PER_CHUNK_GRID_AXIS } from "../core/vars.ts";
import { processMap } from "../tiled-map/types.ts";
import { initGridProgram } from "./src/graphic/gridProgram.ts";
import { identity, ortho, translate } from "./src/graphic/math.ts";
import { getUniformBlocksInfo, getUniformInfo } from "./src/graphic/utilities.ts";
import "./src/else/wss.ts";
import "../core/bootstrap.ts";
import { spriteAtlasRegistry, spriteRegistry } from "../core/sprite/defining.ts";
import { cgotdRegistry, sgotdRegistry } from "../core/game-object/defining.ts";
import { ComplexGameObjectResolver, SimpleGameObjectResolver } from "../core/game-object/resolving.ts";
import { resolveSpriteAtlases, resolveSprites } from "../core/sprite/resolving.ts";
import { createSpriteIndexTable } from "../core/sprite/binding.ts";
import { allocateSpritesInCanvas } from "./src/graphic/texture.ts";
import { ServiceResolver } from "../core/dependency/service.ts";
import { chunkManagerService } from "../domain-client/chunk/chunkManager.ts";
import { index2coords } from "../core/numbers.ts";

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
let updateTexture = () => { };
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
  draw();
});

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

const ab = new ArrayBuffer(32 * 2000);
const ta = new Float32Array(ab);
const ia = new Int32Array(ab);

const { glProgram, glVAOGrid, glTilesBuffer } = initGridProgram(gl);

// processMap1().then((chunkManager) => {
//   let n = 0;
//   for (const texture of chunkManager.binaries) {
//     console.log({ texture });
//     let i = 0;
//     for (let y = TILES_PER_CHUNK_GRID_AXIS - 1; y >= 0; y--) {
//       for (let x = 0; x < TILES_PER_CHUNK_GRID_AXIS; x++) {
//         const textureIndex = texture[i];
//         i++;
//         if (textureIndex === 0) {
//           continue;
//         }
//         ta[n + 0] = x * 32.0;
//         ta[n + 1] = y * 32.0;
//         ia[n + 2] = textureIndex;
//         ta[n + 3] = 1;
//         n += 4;
//       }
//     }
//     ta[n + 0] = 8 * 32.0;
//     ta[n + 1] = 8 * 32.0;
//     ia[n + 2] = 0;
//     ta[n + 3] = 1;
//     n += 4;
//   }
//   gl.bindBuffer(gl.ARRAY_BUFFER, glTilesBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, ab, gl.DYNAMIC_DRAW);
//   draw();
// });

async function loadMap() {
  const resolver = new ServiceResolver();
  const chunkManager = await resolver.resolve(chunkManagerService);
  let n = 0;
  for (const chunk of chunkManager.chunks.values()) {
    const segment = chunk.segment!;
    console.log({ segment });
    let i = 0;
    for (let y = TILES_PER_CHUNK_GRID_AXIS - 1; y >= 0; y--) {
      for (let x = 0; x < TILES_PER_CHUNK_GRID_AXIS; x++) {
        const textureIndex = segment.grid.read(i);
        i++;
        if (textureIndex === 0) {
          continue;
        }
        ta[n + 0] = x * 32.0;
        ta[n + 1] = y * 32.0;
        ta[n + 2] = 32.0;
        ta[n + 3] = 32.0;
        ta[n + 4] = index2coords(textureIndex)[0] * 32.0;
        ta[n + 5] = index2coords(textureIndex)[1] * 32.0;
        ta[n + 6] = 0;
        ta[n + 7] = 0;
        n += 8;
      }
    }
    n += 8;
    break;
  }
  console.log({ ab });
  gl.bindBuffer(gl.ARRAY_BUFFER, glTilesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, ab, gl.DYNAMIC_DRAW);
  draw();
}

// processMap1().then((chunkManager) => {
//   let n = 0;
//   for (const texture of chunkManager.binaries) {
//     console.log({ texture });
//     let i = 0;
//     for (let y = TILES_PER_CHUNK_GRID_AXIS - 1; y >= 0; y--) {
//       for (let x = 0; x < TILES_PER_CHUNK_GRID_AXIS; x++) {
//         const textureIndex = texture[i];
//         i++;
//         if (textureIndex === 0) {
//           continue;
//         }
//         ta[n + 0] = x * 32.0;
//         ta[n + 1] = y * 32.0;
//         ia[n + 2] = textureIndex;
//         ta[n + 3] = 1;
//         n += 4;
//       }
//     }
//     ta[n + 0] = 8 * 32.0;
//     ta[n + 1] = 8 * 32.0;
//     ia[n + 2] = 0;
//     ta[n + 3] = 1;
//     n += 4;
//   }
//   gl.bindBuffer(gl.ARRAY_BUFFER, glTilesBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, ab, gl.DYNAMIC_DRAW);
//   draw();
// });


setTimeout(loadMap, 500);

console.log({ ab });

gl.useProgram(glProgram);
const projectionLoc1 = gl.getUniformLocation(glProgram, "u_Projection");
const viewMatrixLoc = gl.getUniformLocation(glProgram, "u_View");
const textureLoc1 = gl.getUniformLocation(glProgram, "u_texture");
console.log(getUniformBlocksInfo(gl, glProgram));
console.log(getUniformInfo(gl, glProgram));
gl.bindVertexArray(glVAOGrid);

const projection = new Float32Array(16);
gl.uniformMatrix4fv(projectionLoc1, false, projection);
gl.uniform1i(textureLoc1, 0);
// gl.uniform1ui(toLoc, 50);
gl.clearColor(1.0, 0.4, 0.8, 1.0);
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

const keys: Record<string, boolean> = {};
document.addEventListener("keydown", (event) => {
  keys[event.code] = true;
});
document.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

const viewMatrix = new Float32Array(16);
identity(viewMatrix);
gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

function processKeyboard(deltaTime: number) {
  let y = 0;
  let x = 0;
  if (keys['KeyW'] === true) {
    y = -0.3 * deltaTime;
  }
  if (keys['KeyS'] === true) {
    y = 0.3 * deltaTime;
  }
  if (keys['KeyD'] === true) {
    x = -0.3 * deltaTime;
  }
  if (keys['KeyA'] === true) {
    x = 0.3 * deltaTime;
  }
  translate(viewMatrix, viewMatrix, [x, y, 0]);
  gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
}

gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function resizeCanvas() {

  const w = 32 * 16 * 2;
  const h = 32 * 9 * 2;

  const ratio = 9 / 16;

  canvas.width = w;
  canvas.height = h;

  ortho(projection, 0, w / 2, 0, h / 2, -10, 10);
  gl.uniformMatrix4fv(projectionLoc1, false, projection);
  gl.viewport(0, 0, canvas.width, canvas.height);
  console.log(canvas.width, "x", canvas.height);
}
// resize the canvas to fill browser window dynamically
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let then = 0;
let frameCount = 0;
let timeAccumulator = 0;

function mainLoop(now: number) {
  const deltaTime = now - then;
  if (deltaTime > 0) {
    timeAccumulator += deltaTime;
    if (frameCount === 9) {
      const averageFrameTime = timeAccumulator / frameCount;
      const fps = 1000 / averageFrameTime;
      frameCount = 0;
      timeAccumulator = 0;
    }
    processKeyboard(deltaTime);
    updateLogic(deltaTime);
    draw();
    then = now;
    frameCount++;
  }
  requestAnimationFrame(mainLoop);
}

function updateLogic(deltaTime: number) {
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 2000);
  updateTexture();
}

const s = new SimpleGameObjectResolver({ registry: sgotdRegistry });
const sgoMap = s.resolveGameObjectTypes();

const c = new ComplexGameObjectResolver({ registry: cgotdRegistry });
const cgoMap = c.resolveGameObjectTypes();

(async function () {
  const atlases = resolveSpriteAtlases(spriteAtlasRegistry);
  const spritesMap = resolveSprites({ atlases, spriteRegistry });
  const sprites = createSpriteIndexTable({ spritesMap });

  const res = await allocateSpritesInCanvas({ sprites });
  for (const context of res.contexts) {
    // document.body.appendChild(context.canvas);
  }
})();

mainLoop(0);
