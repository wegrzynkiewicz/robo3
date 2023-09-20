import { assertNonNull } from "../common/asserts.ts";
import { processMap } from "../tiled-map/types.ts";
import "./src/else/wss.ts";
import "../core/bootstrap.ts";
import { spriteAtlasRegistry, spriteRegistry } from "../core/sprite/defining.ts";
import { cgotdRegistry, sgotdRegistry } from "../core/game-object/defining.ts";
import { ComplexGameObjectResolver, SimpleGameObjectResolver } from "../core/game-object/resolving.ts";
import { resolveSpriteAtlases, resolveSprites } from "../core/sprite/resolving.ts";
import { createSpriteIndexTable } from "../core/sprite/binding.ts";
import { allocateSpritesInCanvas } from "./src/graphic/texture.ts";
import { ServiceResolver } from "../core/dependency/service.ts";
import { displayService } from "./src/graphic/Display.ts";
import { canvasService, webGLService } from "./src/graphic/WebGL.ts";
import { mainLoopService } from "./src/MainLoop.ts";
import { debugInfoService } from "./src/debug/DebugInfo.ts";
import { keyboardService } from "./src/keyboard/Keyboard.ts";
import { phaseManagerService } from "./src/phase/PhaseManager.ts";
import { tilesProgramService } from "./src/graphic/tiles/TilesProgram.ts";

async function start() {
  const resolver = new ServiceResolver();
  const canvas = document.getElementById("primary-canvas") as HTMLCanvasElement | null;
  assertNonNull(canvas, "cannot-find-primary-canvas");
  resolver.inject(canvasService, canvas);

  const gl = await resolver.resolve(webGLService);
  const display = await resolver.resolve(displayService);
  const keyboard = await resolver.resolve(keyboardService);
  const mainLoop = await resolver.resolve(mainLoopService);
  const debugInfo = await resolver.resolve(debugInfoService);
  const phaseManager = await resolver.resolve(phaseManagerService);
  const tilesProgram = await resolver.resolve(tilesProgramService);

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
      phaseManager.processKeyboard();
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

  const nearestSampler = gl.createSampler();
  assertNonNull(nearestSampler, "cannot-create-nearest-sampler");
  gl.samplerParameteri(nearestSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.samplerParameteri(nearestSampler, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindSampler(0, nearestSampler);

  tilesProgram.bind();
  const textureLoc1 = gl.getUniformLocation(tilesProgram.glProgram, "u_texture");

  gl.uniform1i(textureLoc1, 0);

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

  mainLoop.run();

}
start();
