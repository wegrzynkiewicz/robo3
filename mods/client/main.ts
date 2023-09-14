import { assertNonNull } from "../common/asserts.ts";
import { processMap } from "../tiled-map/types.ts";
import { initGridProgram } from "./src/graphic/gridProgram.ts";
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
import { CornerRectangle, cornerRect, intersectsNonStrict } from "../math/CornerRectangle.ts";
import { Point, point } from "../math/Point.ts";
import { identity, fromTranslation, ortho } from "../math/mat4.ts";

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

processMap().then((imageData) => {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
  gl.generateMipmap(gl.TEXTURE_2D);
  draw();
});

const info = {
  fps: 0,
  visibleTilesCount: 0,
}

const nearestSampler = gl.createSampler();
assertNonNull(nearestSampler, "cannot-create-nearest-sampler");
gl.samplerParameteri(nearestSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.bindSampler(0, nearestSampler);

const ab = new ArrayBuffer(32 * 30000);
const ta = new Float32Array(ab);

const { glProgram, glVAOGrid, glTilesBuffer } = initGridProgram(gl);

gl.useProgram(glProgram);
const projectionLoc1 = gl.getUniformLocation(glProgram, "u_Projection");
const viewMatrixLoc = gl.getUniformLocation(glProgram, "u_View");
const textureLoc1 = gl.getUniformLocation(glProgram, "u_texture");
console.log(getUniformBlocksInfo(gl, glProgram));
console.log(getUniformInfo(gl, glProgram));
gl.bindVertexArray(glVAOGrid);

const viewMatrix = new Float32Array(16);

class Viewport {
  public readonly centerPoint = point(0, 0);
  public readonly worldHalfSize = point(0, 0);
  public readonly worldSize = point(0, 0);
  public readonly worldSpaceRect = cornerRect(0, 0, 0, 0);
  public constructor(
    public readonly viewMatrix: Float32Array,
  ) {
    identity(viewMatrix);
    this.lookAt(0, 0);
  }

  public setWorldSize(x: number, y: number): void {
    this.worldSize.x = x;
    this.worldSize.y = y;
    this.worldHalfSize.x = x / 2;
    this.worldHalfSize.y = y / 2;
  }

  public lookAt(x: number, y: number): void {
    const { centerPoint, viewMatrix, worldHalfSize, worldSpaceRect } = this;

    centerPoint.x = x;
    centerPoint.y = y;
    worldSpaceRect.x1 = x - worldHalfSize.x;
    worldSpaceRect.y1 = y - worldHalfSize.y;
    worldSpaceRect.x2 = x + worldHalfSize.x;
    worldSpaceRect.y2 = y + worldHalfSize.y;

    const mx = -x + worldHalfSize.x;
    const my = y + worldHalfSize.y;
    const mz = 0;

    fromTranslation(viewMatrix, mx, my, mz);
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
  }
}

const keys: Record<string, boolean> = {};
document.addEventListener("keydown", (event) => {
  keys[event.code] = true;
});
document.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

const viewport = new Viewport(viewMatrix);
let elements = 0;
async function loadMap() {
  const resolver = new ServiceResolver();
  const chunkManager = await resolver.resolve(chunkManagerService);
  let n = 0;
  elements = 0;
  for (const chunk of chunkManager.chunks.values()) {
    if (intersectsNonStrict(chunk.worldSpaceBoundRect, viewport.worldSpaceRect)) {
      if (keys['KeyF']) {
        console.log(chunk);
      }
      for (const go of chunk.gos) {
        if (intersectsNonStrict(go.worldSpaceRect, viewport.worldSpaceRect)) {
          const { goTypeId, spacePosition } = go;
          ta[n + 0] = spacePosition.x;
          ta[n + 1] = spacePosition.y;
          ta[n + 2] = 32.0;
          ta[n + 3] = 32.0;
          ta[n + 4] = index2coords(goTypeId)[0] * 32.0;
          ta[n + 5] = index2coords(goTypeId)[1] * 32.0;
          ta[n + 6] = 0;
          ta[n + 7] = 0;
          n += 8;
          elements++;
        }
      }
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, glTilesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, ta, gl.DYNAMIC_DRAW, 0, elements * 8);
  info.visibleTilesCount = elements;
  draw();
}

setTimeout(loadMap, 1000);

console.log({ ab });

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

let y = 0;
let x = 0;
let zoom = 2;

function processKeyboard(deltaTime: number) {
  const speed = 16;
  if (keys["KeyW"] === true) {
    y += -speed;
  }
  if (keys["KeyS"] === true) {
    y += speed;
  }
  if (keys["KeyD"] === true) {
    x += speed;
  }
  if (keys["KeyA"] === true) {
    x += -speed;
  }
  if (keys["KeyQ"] === true) {
    x = 0;
    y = 0;
  }
  if (keys["KeyZ"] === true) {
    zoom = 1;
    resizeCanvas();
  }
  if (keys["KeyX"] === true) {
    zoom = 2;
    resizeCanvas();
  }
  if (keys["KeyC"] === true) {
    zoom = 3;
    resizeCanvas();
  }

  viewport.lookAt(x, y);
}

gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function resizeCanvas() {
  const tileSize = 32;
  const maxTileW = 32;
  const maxTileH = 32;
  const bodyW = document.body.clientWidth;
  const bodyH = document.body.clientHeight;
  const bodyTileW = Math.floor(bodyW / tileSize / zoom);
  const bodyTileH = Math.floor(bodyH / tileSize / zoom);
  const tileW = Math.min(bodyTileW, maxTileW - 1) + 1;
  const tileH = Math.min(bodyTileH, maxTileH - 1) + 1;
  const worldW = tileW * tileSize;
  const worldH = tileH * tileSize;
  const canvasW = worldW * zoom;
  const canvasH = worldH * zoom;
  canvas.width = canvasW;
  canvas.height = canvasH;

  viewport.setWorldSize(worldW, worldH);
  ortho(projection, 0, worldW, 0, worldH, -10, 10);
  gl.viewport(0, 0, canvasW, canvasH);
  gl.uniformMatrix4fv(projectionLoc1, false, projection);
}
// resize the canvas to fill browser window dynamically
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let then = 0;
let frameCount = 0;
let timeAccumulator = 0;

function updateDebugInfo() {
  const out = [];
  out.push(`FPS ${info.fps.toFixed(2)}`);
  const sw = document.body.clientWidth;
  const sh = document.body.clientHeight;
  out.push(`Screen: ${sw} ${sh}`);
  const { worldSize: ws, centerPoint: cp, worldSpaceRect: wr } = viewport
  out.push(`VP-Axis: ${ws.x / 32} ${ws.y / 32}`);
  out.push(`VP-WorldSize: ${ws.x} ${ws.y}`);
  out.push(`VP-CenterPoint: ${cp.x} ${cp.y}`);
  out.push(`VP-WorldRect: ${wr.x1} ${wr.y1} ${wr.x2} ${wr.y2}`);
  out.push(`VP-Tiles: ${info.visibleTilesCount}`);
  document.getElementById('debug')!.textContent = out.join('\n');
}

function mainLoop(now: number) {
  const deltaTime = now - then;
  if (deltaTime > 0) {
    timeAccumulator += deltaTime;
    if (frameCount === 9) {
      const averageFrameTime = timeAccumulator / frameCount;
      const fps = 1000 / averageFrameTime;
      info.fps = fps;
      frameCount = 0;
      timeAccumulator = 0;
    }
    processKeyboard(deltaTime);
    updateLogic(deltaTime);
    loadMap();
    draw();
    updateDebugInfo();
    then = now;
    frameCount++;
  }
  requestAnimationFrame(mainLoop);
}

function updateLogic(deltaTime: number) {
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, elements);
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
