import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { fpsCounterService } from "./FPSCounter.ts";
import { cameraManagerService } from "./camera/CameraManager.ts";
import { debugInfoService } from "./debug/DebugInfo.ts";
import { sceneViewportService } from "./graphic/tiles/SceneViewport.ts";
import { tilesRendererService } from "./graphic/tiles/TilesRenderer.ts";
import { phaseManagerService } from "./phase/PhaseManager.ts";

export interface Looper {
  loop(now: DOMHighResTimeStamp): void;
}

export class MainLoop implements Looper {
  protected animationFrameId = 0;
  protected readonly boundLoop: (now: DOMHighResTimeStamp) => void;
  protected isRunning = false;

  public constructor(
    public readonly loopers: Looper[],
  ) {
    this.boundLoop = this.loop.bind(this);
  }

  public start(): void {
    this.isRunning = true;
    this.boundLoop(0);
  }

  public stop(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  public loop(now: DOMHighResTimeStamp): void {
    for (const looper of this.loopers) {
      looper.loop(now);
    }
    if (this.isRunning === true) {
      this.animationFrameId = requestAnimationFrame(this.boundLoop);
    }
  }
}

export const mainLoopService = registerService({
  name: "mainLoop",
  async provider(resolver: ServiceResolver): Promise<MainLoop> {
    return new MainLoop([
      await resolver.resolve(phaseManagerService),
      await resolver.resolve(cameraManagerService),
      await resolver.resolve(sceneViewportService),
      await resolver.resolve(tilesRendererService),
      await resolver.resolve(fpsCounterService),
      await resolver.resolve(debugInfoService),
    ]);
  },
});
