import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { fpsCounterService } from "./FPSCounter.ts";
import { cameraManagerService } from "./camera/CameraManager.ts";
import { debugInfoService } from "./debug/DebugInfo.ts";
import { sceneViewportService } from "./graphic/tiles/SceneViewport.ts";
import { tilesRendererService } from "./graphic/tiles/TilesRenderer.ts";

export interface Looper {
  loop(now: DOMHighResTimeStamp): void;
}

export class MainLoop {
  protected animationFrameId = 0;
  protected readonly boundLoop: (now: DOMHighResTimeStamp) => void;
  protected isRunning = false;

  public constructor(
    public readonly loopers: Looper[],
  ) {
    this.boundLoop = this.loop.bind(this);
  }

  public run(): void {
    this.isRunning = true;
    this.boundLoop(0);
  }

  public pause(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  public loop(now: DOMHighResTimeStamp) {
    for (const looper of this.loopers) {
      looper.loop(now);
    }
    if (this.isRunning === true) {
      this.animationFrameId = requestAnimationFrame(this.boundLoop);
    }
  }
}

export const mainLoopService = registerService({
  async provider(resolver: ServiceResolver): Promise<MainLoop> {
    return new MainLoop([
      await resolver.resolve(fpsCounterService),
      await resolver.resolve(cameraManagerService),
      await resolver.resolve(sceneViewportService),
      await resolver.resolve(tilesRendererService),
      await resolver.resolve(debugInfoService),
    ]);
  },
});
