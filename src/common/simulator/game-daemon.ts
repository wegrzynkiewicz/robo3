import { createPerformanceCounter } from "../utils/performance-counter.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { FPSCounter, provideFPSCounter } from "./fps-counter.ts";
import { Daemon, Framer, Looper } from "./looper.ts";
import { provideScopedBeingSimulator } from "../being/simulator.ts";

export class GameSimulatorDaemon implements Daemon, Framer {
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
      looper.loop(this.fpsCounter.deltaTime / 1000);
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

export function provideScopedGameSimulatorDaemon(resolver: ServiceResolver) {
  return new GameSimulatorDaemon(
    resolver.resolve(provideFPSCounter),
  );
}

export function feedGameSimulatorDaemon(resolver: ServiceResolver, gameSimulatorDaemon: GameSimulatorDaemon) {
  gameSimulatorDaemon.loopers.push(resolver.resolve(provideScopedBeingSimulator));
}
