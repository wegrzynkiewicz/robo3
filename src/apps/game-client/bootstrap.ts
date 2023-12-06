import "../../common/canvas/UnifiedOffscreenCanvas.ts";
import "../../core/bootstrap.ts";
import { assertNonNull } from "../../common/utils/asserts.ts";
import { cgotdRegistry, sgotdRegistry } from "../../common/game-object/defining.ts";
import { ComplexGameObjectResolver, SimpleGameObjectResolver } from "../../common/game-object/resolving.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { SpriteImageExtractor } from "../../common/sprite/SpriteImageDataExtractor.ts";
import { logger } from "../../common/utils/logger.ts";
import { loginGARequestDef, loginGAResponseDef } from "../../features/login/loginGA.ts";
import { SpriteAllocator } from "../../common/sprite/SpriteAllocator.ts";
import { SpriteImage } from "../../common/sprite/sprite.ts";
import { provideMainUAProcessor, resolveUAProcessHandlers } from "./ua/processor.ts";
import { provideNetworkLatencyDaemon } from "../../features/stats/NetworkLatencyDaemon.ts";
import { provideMainGABus } from "../../common/action/bus.ts";
import { provideMutationGABusSubscriber } from "../../domain/MutationGABusSubscriber.ts";
import { provideApp } from "./App.ts";
import { provideMainLoop } from "./MainLoop.ts";
import { provideDebugInfo } from "./debug/DebugInfo.ts";
import { provideDisplay } from "./graphic/Display.ts";
import { provideMainKABus } from "./keyboard/KABus.ts";
import { provideKeyboard } from "./keyboard/Keyboard.ts";
import { providePhaseManager } from "./phase/PhaseManager.ts";
import { provideMainUABus } from "./ua/UABus.ts";
import { provideCanvas } from "./graphic/WebGL.ts";
import { provideKAProcessor } from "./keyboard/KAProcessor.ts";
import { provideTilesTexture2DArray } from "./graphic/tiles/TilesTexture2DArray.ts";
import { provideSpriteIndicesTexture } from "./graphic/tiles/SpriteIndicesTexture.ts";
import { provideWebSocket } from "../../common/action/sender.ts";
import { provideGAProcessor } from "../../common/action/processor.ts";
import { provideClientGAProcessor } from "../../domain-client/clientGAProcessor.ts";
import { provideGACommunicator } from "../../common/action/communication.ts";
import { provideClientSpriteAtlasLoader } from "../../domain-client/sprite/allocation/clientSpriteAtlasLoader.ts";

async function start() {
  const resolver = new ServiceResolver();
  const canvas = document.getElementById("primary-canvas") as HTMLCanvasElement | null;
  assertNonNull(canvas, "cannot-find-primary-canvas");
  resolver.inject(provideCanvas, canvas);

  (globalThis as any).app = resolver.resolve(provideApp);
  const display = resolver.resolve(provideDisplay);
  const keyboard = resolver.resolve(provideKeyboard);
  const mainLoop = resolver.resolve(provideMainLoop);
  const debugInfo = resolver.resolve(provideDebugInfo);
  const phaseManager = resolver.resolve(providePhaseManager);

  const mainKABus = resolver.resolve(provideMainKABus);
  const mainKAProcessor = resolver.resolve(provideKAProcessor);
  mainKABus.subscribers.add(mainKAProcessor);

  const mainUABus = resolver.resolve(provideMainUABus);
  const mainUAProcessor = resolver.resolve(provideMainUAProcessor);
  resolveUAProcessHandlers(resolver, mainUAProcessor);
  mainUABus.subscribers.add(mainUAProcessor);

  const mainGABus = resolver.resolve(provideMainGABus);

  const tilesTexture2DArray = resolver.resolve(provideTilesTexture2DArray);
  const spriteIndicesTexture = resolver.resolve(provideSpriteIndicesTexture);
  const clientSpriteAtlasLoader = resolver.resolve(provideClientSpriteAtlasLoader);
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

  resolver.inject(provideWebSocket, ws);
  const processor = await resolver.resolve(provideClientGAProcessor);
  resolver.inject(provideGAProcessor, processor);
  const communicator = await resolver.resolve(provideGACommunicator);
  const networkLatencyDaemon = resolver.resolve(provideNetworkLatencyDaemon);
  const mutationGABusSubscriber = resolver.resolve(provideMutationGABusSubscriber);

  mainGABus.subscribers.add(mutationGABusSubscriber);

  ws.addEventListener("open", async (event) => {
    const { status } = await communicator.requestor.request(
      loginGARequestDef,
      loginGAResponseDef,
      { token: "test" },
    );
    const data = new Uint8Array(8);
    networkLatencyDaemon.stop();
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
