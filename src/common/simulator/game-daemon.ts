import { createPerformanceCounter } from "../utils/performance-counter.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { FPSCounter, provideFPSCounter } from "./fps-counter.ts";
import { Daemon, Framer, Looper } from "./looper.ts";

export class GameDaemon implements Daemon, Framer {
  public loopers: Looper[] = [];
  public name = "game";
  protected boundFrame: (now: number) => void;
  protected fps = 0;
  protected frameDuration = 0;
  protected intervalId = 0;
  protected performance = createPerformanceCounter("game-simulation", 1);

  public constructor(
    protected readonly fpsCounter: FPSCounter,
  ) {
    this.boundFrame = () => {
      this.frame(performance.now());
    }
    this.setFPS(10);
  }

  public setFPS(fps: number) {
    this.fps = fps;
    this.frameDuration = Math.floor(1000 / fps);
  }

  public frame(now: number): void {
    this.fpsCounter.frame(now);
    this.performance.start();
    for (const looper of this.loopers) {
      looper.loop(this.fpsCounter.deltaTime);
    }
    this.performance.stop();
  }

  public start() {
    this.intervalId = setInterval(this.boundFrame, this.frameDuration);
  }

  public stop() {
    clearInterval(this.intervalId);
  }
}

export function provideScopedGameDaemon(resolver: ServiceResolver) {
  return new GameDaemon(
    resolver.resolve(provideFPSCounter),
  );
}

export function feedGameDaemon(resolver: ServiceResolver, gameDaemon: GameDaemon) {
  gameDaemon.loopers.push(resolver.resolve(provideFPSCounter));
}
