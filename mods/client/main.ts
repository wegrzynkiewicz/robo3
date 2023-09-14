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
import { intersectsNonStrict } from "../math/CornerRectangle.ts";
import { displayService } from "./src/graphic/Display.ts";
import { viewportService } from "./src/graphic/Viewport.ts";
import { canvasService, webGLService } from "./src/graphic/WebGL.ts";
import { primaryUBOService } from "./src/graphic/PrimaryUBO.ts";

async function start() {
  const resolver = new ServiceResolver();
  const canvas = document.getElementById("primary-canvas") as HTMLCanvasElement | null;
  assertNonNull(canvas, "cannot-find-primary-canvas");
  resolver.inject(canvasService, canvas);

  const [gl, viewport, primaryUBO, display, chunkManager] = await Promise.all([
    resolver.resolve(webGLService),
    resolver.resolve(viewportService),
    resolver.resolve(primaryUBOService),
    resolver.resolve(displayService),
    resolver.resolve(chunkManagerService),
  ])

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
  gl.bindVertexArray(glVAOGrid);

  const keys: Record<string, boolean> = {};
  document.addEventListener("keydown", (event) => {
    keys[event.code] = true;
  });
  document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  let elements = 0;
  function loadMap() {
    let n = 0;
    elements = 0;
    for (const chunk of chunkManager.chunks.values()) {
      if (intersectsNonStrict(chunk.worldSpaceBoundRect, viewport.worldSpaceRect)) {
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
  }

  setTimeout(loadMap, 1000);

  gl.uniform1i(textureLoc1, 0);

  let y = 0;
  let x = 0;

  function processKeyboard() {
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
      display.scale = 1;
    }
    if (keys["KeyX"] === true) {
      display.scale = 2;
    }
    if (keys["KeyC"] === true) {
      display.scale = 3;
    }

    viewport.lookAt(x, y);
    const { projectionMatrix, viewMatrix } = primaryUBO;
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    gl.uniformMatrix4fv(projectionLoc1, false, projectionMatrix);
  }

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resizeWindow() {
    display.setClientSize(
      document.body.clientWidth,
      document.body.clientHeight,
    );
  }
  // resize the canvas to fill browser window dynamically
  window.addEventListener("resize", resizeWindow);
  resizeWindow();

  let then = 0;
  let frameCount = 0;
  let timeAccumulator = 0;

  function updateDebugInfo() {
    const out = [];
    out.push(`FPS: ${info.fps.toFixed(2)}`);
    const { client, scale } = display
    out.push(`SCR-Size: ${client.x} ${client.y}`);
    out.push(`SCR-Scale: ${scale}`);
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
      processKeyboard();
      loadMap();
      draw();
      updateDebugInfo();
      then = now;
      frameCount++;
    }
    requestAnimationFrame(mainLoop);
  }

  function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, elements);
  }

  const s = new SimpleGameObjectResolver({ registry: sgotdRegistry });
  const sgoMap = s.resolveGameObjectTypes();

  const c = new ComplexGameObjectResolver({ registry: cgotdRegistry });
  const cgoMap = c.resolveGameObjectTypes();

  const atlases = resolveSpriteAtlases(spriteAtlasRegistry);
  const spritesMap = resolveSprites({ atlases, spriteRegistry });
  const sprites = createSpriteIndexTable({ spritesMap });

  const res = await allocateSpritesInCanvas({ sprites });
  for (const context of res.contexts) {
    // document.body.appendChild(context.canvas);
  }

  mainLoop(0);

}
start();
