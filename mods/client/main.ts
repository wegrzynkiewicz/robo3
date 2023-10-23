import "../canvas/UnifiedOffscreenCanvas.ts";
import "../core/bootstrap.ts";
import { assertNonNull } from "../common/asserts.ts";
import { processMap } from "../tiled-map/types.ts";
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
import { clientSpriteAtlasLoaderService } from "../domain-client/sprite/allocation/clientSpriteAtlasLoader.ts";
import { SpriteImageExtractor } from "../core/sprite/SpriteImageDataExtractor.ts";
import { logger } from "../common/logger.ts";
import { gaCommunicator } from "../core/action/communication.ts";
import { gaProcessorService } from "../core/action/processor.ts";
import { gaSenderWebSocketService } from "../core/action/sender.ts";
import { clientGAProcessor } from "../domain-client/clientGAProcessor.ts";
import { loginGARequestDef,loginGAResponseDef } from "../domain/loginGA.ts";

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
  const clientSpriteAtlasLoader = await resolver.resolve(clientSpriteAtlasLoaderService);
  const spriteAtlasImages = await clientSpriteAtlasLoader.loadSpriteAtlasImages();

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

  const { dataSource, ctx } = await processMap();
  let x = 0;

  for (const i of spriteAtlasImages) {
    const spriteImageExtractor = new SpriteImageExtractor(i);
    for (const sprite of spriteImageExtractor.extract(i)) {
      ctx.tilesTextureAllocator.insert(sprite.image);
      // ctx.tilesTextureAllocator.contexts.map((c) => document.body.appendChild(c.canvas));
    }
  }
  for (const context of dataSource) {
    const data = context.getImageData(0, 0, 1024, 1024);
    tilesTexture2DArray.update(x++, data);
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

  const { hostname } = window.location;
  const ws = new WebSocket(`ws://${hostname}:8000/wss/token`);
  ws.binaryType = "arraybuffer";

  resolver.inject(gaSenderWebSocketService, ws);
  const processor = await resolver.resolve(clientGAProcessor);
  resolver.inject(gaProcessorService, processor);
  const communicator = await resolver.resolve(gaCommunicator);

  ws.addEventListener("open", async (event) => {
    const { status } = await communicator.requestor.request(
      loginGARequestDef,
      loginGAResponseDef,
      { token: "test" },
    );
    const data = new Uint8Array(8);
  });

  // Listen for messages
  ws.addEventListener("message", async (message) => {
    try {
      await communicator.receiver.receive(message.data);
    } catch (error) {
      logger.error("error-when-processing-wss-message", { error });
    }
  });

  ws.addEventListener("close", (event) => {
    console.log("Close", event);
  });

  mainLoop.run();
}
document.addEventListener("DOMContentLoaded", start);
