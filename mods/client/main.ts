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
import { canvasService } from "./src/graphic/WebGL.ts";
import { mainLoopService } from "./src/MainLoop.ts";
import { debugInfoService } from "./src/debug/DebugInfo.ts";
import { keyboardService } from "./src/keyboard/Keyboard.ts";
import { phaseManagerService } from "./src/phase/PhaseManager.ts";
import { appService } from "./src/App.ts";
import { tilesTexture2DArrayService } from "./src/graphic/tiles/TilesTexture2DArray.ts";

async function start() {
  const resolver = new ServiceResolver();
  const canvas = document.getElementById("primary-canvas") as HTMLCanvasElement | null;
  assertNonNull(canvas, "cannot-find-primary-canvas");
  resolver.inject(canvasService, canvas);

  (globalThis as any).app = await resolver.resolve(appService);
  const display = await resolver.resolve(displayService);
  const keyboard = await resolver.resolve(keyboardService);
  const mainLoop = await resolver.resolve(mainLoopService);
  const debugInfo = await resolver.resolve(debugInfoService);
  const phaseManager = await resolver.resolve(phaseManagerService);
  const tilesTexture2DArray = await resolver.resolve(tilesTexture2DArrayService);

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
  document.addEventListener("keydown", onKeyDown);

  function onKeyUp(event: KeyboardEvent) {
    if (document.activeElement === document.body) {
      keyboard.keyUp(event);
    }
  }
  document.addEventListener("keyup", onKeyUp);

  debugInfo.enable();

  processMap().then((contexts) => {
    let x = 0;
    for (const context of contexts) {
      const data = context.getImageData(0, 0, 1024, 1024);
      tilesTexture2DArray.update(x++, data);
    }
  });

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
document.addEventListener('DOMContentLoaded', start);
