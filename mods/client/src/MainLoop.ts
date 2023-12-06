import { ServiceResolver } from "../../dependency/service.ts";
import { provideFPSCounter } from "./FPSCounter.ts";
import { provideCameraManager } from "./camera/CameraManager.ts";
import { provideDebugInfo } from "./debug/DebugInfo.ts";
import { provideSceneViewport } from "./graphic/tiles/SceneViewport.ts";
import { provideTilesRenderer } from "./graphic/tiles/TilesRenderer.ts";
import { providePhaseManager } from "./phase/PhaseManager.ts";

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

export function provideMainLoop(resolver: ServiceResolver) {
  return new MainLoop([
    resolver.resolve(providePhaseManager),
    resolver.resolve(provideCameraManager),
    resolver.resolve(provideSceneViewport),
    resolver.resolve(provideTilesRenderer),
    resolver.resolve(provideFPSCounter),
    resolver.resolve(provideDebugInfo),
  ]);
}
