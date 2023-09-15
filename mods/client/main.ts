import { assertNonNull } from "../common/asserts.ts";
import { processMap } from "../tiled-map/types.ts";
import { initGridProgram } from "./src/graphic/gridProgram.ts";
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
import { mainLoopService } from "./src/MainLoop.ts";
import { debugInfoService } from "./src/debug/DebugInfo.ts";
import { keyboardService } from "./src/keyboard/Keyboard.ts";
import { gameContextService } from "./src/context/ContextManager.ts";

async function start() {
  const resolver = new ServiceResolver();
  const canvas = document.getElementById("primary-canvas") as HTMLCanvasElement | null;
  assertNonNull(canvas, "cannot-find-primary-canvas");
  resolver.inject(canvasService, canvas);

  const [
    gl,
    viewport,
    primaryUBO,
    display,
    chunkManager,
    keyboard,
    mainLoop,
    debugInfo,
    gameContext,
  ] = await Promise.all([
    resolver.resolve(webGLService),
    resolver.resolve(viewportService),
    resolver.resolve(primaryUBOService),
    resolver.resolve(displayService),
    resolver.resolve(chunkManagerService),
    resolver.resolve(keyboardService),
    resolver.resolve(mainLoopService),
    resolver.resolve(debugInfoService),
    resolver.resolve(gameContextService),
  ])

  function resizeWindow() {
    display.setClientSize(
      document.body.clientWidth,
      document.body.clientHeight,
    );
  }
  globalThis.addEventListener("resize", resizeWindow);
  resizeWindow();

  function onKeyDown(event: KeyboardEvent) {
    if (document.activeElement === document.body) {
      keyboard.keyDown(event);
    }
    if (event.repeat === false) {
      gameContext.processKeyboard();
    }
  }
  document.addEventListener('keydown', onKeyDown);

  function onKeyUp(event: KeyboardEvent) {
    if (document.activeElement === document.body) {
      keyboard.keyUp(event);
    }
  }
  document.addEventListener('keyup', onKeyUp);

  debugInfo.enable();

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  processMap().then((imageData) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    gl.generateMipmap(gl.TEXTURE_2D);
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

  gl.uniform1i(textureLoc1, 0);

  let y = 0;
  let x = 0;

  function processKeyboard() {
    const speed = 16;
    const { states } = keyboard;
    if (states["KeyW"] === true) {
      y += -speed;
    }
    if (states["KeyS"] === true) {
      y += speed;
    }
    if (states["KeyD"] === true) {
      x += speed;
    }
    if (states["KeyA"] === true) {
      x += -speed;
    }
    if (states["KeyQ"] === true) {
      x = 0;
      y = 0;
    }
    if (states["KeyZ"] === true) {
      display.scale = 1;
    }
    if (states["KeyX"] === true) {
      display.scale = 2;
    }
    if (states["KeyC"] === true) {
      display.scale = 3;
    }

    viewport.lookAt(x, y);
    const { projectionMatrix, viewMatrix } = primaryUBO;
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    gl.uniformMatrix4fv(projectionLoc1, false, projectionMatrix);
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

  function loop() {
    processKeyboard();
    loadMap();
    requestAnimationFrame(loop);
  }
  mainLoop.run();
  loop();

}
start();
