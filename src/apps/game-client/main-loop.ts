import { ServiceResolver } from "../../common/dependency/service.ts";
import { FPSCounter, provideFPSCounter } from "../../common/game/fps-counter.ts";
import { Framer, Looper } from "../../common/game/looper.ts";
import { provideCameraManager } from "./camera/camera-manager.ts";
import { provideDebugInfo } from "./debug/debug-info.ts";
import { provideSceneViewport } from "./graphic/tiles/scene-viewport.ts";
import { provideTilesRenderer } from "./graphic/tiles/tiles-renderer.ts";
import { providePhaseManager } from "./phase/phase-manager.ts";

export class MainLoop implements Framer {
  public readonly loopers: Looper[] = [];
  protected animationFrameId = 0;
  protected readonly boundFrame: (now: DOMHighResTimeStamp) => void;
  protected isRunning = false;

  public constructor(
    protected readonly fpsCounter: FPSCounter,
  ) {
    this.boundFrame = this.frame.bind(this);
  }

  public start(): void {
    this.isRunning = true;
    this.boundFrame(0);
  }

  public stop(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  public frame(now: DOMHighResTimeStamp): void {
    this.fpsCounter.frame(now);
    for (const looper of this.loopers) {
      looper.loop(this.fpsCounter.deltaTime);
    }
    if (this.isRunning === true) {
      this.animationFrameId = requestAnimationFrame(this.boundFrame);
    }
  }
}

export function provideMainLoop(resolver: ServiceResolver) {
  return new MainLoop(
    resolver.resolve(provideFPSCounter),
  );
}

export function feedMainLoop(resolver: ServiceResolver, mainLoop: MainLoop) {
  mainLoop.loopers.push(resolver.resolve(providePhaseManager));
  mainLoop.loopers.push(resolver.resolve(provideCameraManager));
  mainLoop.loopers.push(resolver.resolve(provideSceneViewport));
  mainLoop.loopers.push(resolver.resolve(provideTilesRenderer));
  mainLoop.loopers.push(resolver.resolve(provideDebugInfo));
}
