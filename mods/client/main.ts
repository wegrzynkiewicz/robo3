import "../canvas/UnifiedOffscreenCanvas.ts";
import "../core/bootstrap.ts";
import { assertNonNull } from "../common/asserts.ts";
import { cgotdRegistry, sgotdRegistry } from "../core/game-object/defining.ts";
import { ComplexGameObjectResolver, SimpleGameObjectResolver } from "../core/game-object/resolving.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { displayService } from "./src/graphic/Display.ts";
import { canvasService } from "./src/graphic/WebGL.ts";
import { mainLoopService } from "./src/MainLoop.ts";
import { debugInfoService } from "./src/debug/DebugInfo.ts";
import { keyboardService } from "./src/keyboard/Keyboard.ts";
import { phaseManagerService } from "./src/phase/PhaseManager.ts";
import { appService } from "./src/App.ts";
import { tilesTexture2DArrayService } from "./src/graphic/tiles/TilesTexture2DArray.ts";
import { clientSpriteAtlasLoaderService } from "../domain-client/sprite/allocation/clientSpriteAtlasLoader.ts";
import { SpriteImageExtractor } from "../sprite/SpriteImageDataExtractor.ts";
import { logger } from "../common/logger.ts";
import { gaCommunicator } from "../core/action/communication.ts";
import { gaProcessorService } from "../core/action/processor.ts";
import { gaSenderWebSocketService } from "../core/action/sender.ts";
import { clientGAProcessor } from "../domain-client/clientGAProcessor.ts";
import { loginGARequestDef, loginGAResponseDef } from "../domain/loginGA.ts";
import { SpriteAllocator } from "../sprite/SpriteAllocator.ts";
import { SpriteImage } from "../sprite/sprite.ts";
import { spriteIndicesTextureService } from "./src/graphic/tiles/SpriteIndicesTexture.ts";
import { networkLatencyDaemonService } from "../domain-client/stats/NetworkLatencyDaemon.ts";
import { kaProcessorService } from "./src/keyboard/KAProcessor.ts";
import { uaProcessorService, resolveUAProcessHandlers } from "./src/ua/processor.ts";

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
  const kaProcessor = await resolver.resolve(kaProcessorService);
  const uaProcessor = await resolver.resolve(uaProcessorService);
  resolveUAProcessHandlers(resolver, uaProcessor);
  const tilesTexture2DArray = await resolver.resolve(tilesTexture2DArrayService);
  const spriteIndicesTexture = await resolver.resolve(spriteIndicesTextureService);
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
      phaseManager.checkKAShortCuts(kaProcessor);
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

  function* unpack(): Generator<SpriteImage, void, unknown> {
    for (const i of spriteAtlasImages) {
      const spriteImageExtractor = new SpriteImageExtractor(i);
      yield* spriteImageExtractor.extract(i);
    }
  }

  let x = 0;
  const spriteAllocator = new SpriteAllocator(1024, 1024);
  const sprites = [...unpack()];
  const allocation = spriteAllocator.allocate(sprites);
  (window as any).bindings = [undefined, ...allocation.bindings];
  for (const context of allocation.canvases) {
    document.body.appendChild(context.toHTMLCanvas());
    const data = context.getImageData(0, 0, 1024, 1024);
    tilesTexture2DArray.update(x++, data);
  }

  allocation.bindings[74].tile.size.w = 1024 * 2;
  allocation.bindings[74].tile.size.h = 1024 * 2;

  const v1 = new Float32Array(256 * 256 * 4);
  const v2 = new Float32Array(256 * 256 * 4);
  let i1 = 0;
  let i2 = 0;
  for (const binding of allocation.bindings) {
    v1[i1++] = binding.texture.mapping.x;
    v1[i1++] = binding.texture.mapping.y;
    v1[i1++] = binding.texture.atlasIndex;
    v1[i1++] = 0;

    v2[i2++] = binding.texture.size.w;
    v2[i2++] = binding.texture.size.h;
    v2[i2++] = binding.tile.size.w;
    v2[i2++] = binding.tile.size.h;
  }
  spriteIndicesTexture.update(0, v1);
  spriteIndicesTexture.update(1, v2);

  const s = new SimpleGameObjectResolver({ registry: sgotdRegistry });
  const sgoMap = s.resolveGameObjectTypes();

  const c = new ComplexGameObjectResolver({ registry: cgotdRegistry });
  const cgoMap = c.resolveGameObjectTypes();

  const { hostname } = window.location;
  const ws = new WebSocket(`ws://${hostname}:8000/wss/token`);
  ws.binaryType = "arraybuffer";

  resolver.inject(gaSenderWebSocketService, ws);
  const processor = await resolver.resolve(clientGAProcessor);
  resolver.inject(gaProcessorService, processor);
  const communicator = await resolver.resolve(gaCommunicator);
  const networkLatencyDaemon = await resolver.resolve(networkLatencyDaemonService);

  ws.addEventListener("open", async (event) => {
    const { status } = await communicator.requestor.request(
      loginGARequestDef,
      loginGAResponseDef,
      { token: "test" },
    );
    const data = new Uint8Array(8);
    networkLatencyDaemon.start();
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

  mainLoop.start();
}
document.addEventListener("DOMContentLoaded", start);
