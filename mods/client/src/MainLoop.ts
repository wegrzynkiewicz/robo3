import { registerService, ServiceResolver } from "../../core/dependency/service.ts";
import { DebugInfo, debugInfoService } from "./debug/DebugInfo.ts";
import { Renderer, rendererService } from "./graphic/Renderer.ts";

export class MainLoop {
  protected animationFrameId = 0;
  protected readonly boundLoop: (now: DOMHighResTimeStamp) => void;
  public fps = 0;
  protected frameCount = 0;
  protected isRunning = false;
  protected then = 0;
  protected timeAccumulator = 0;

  public constructor(
    public readonly debugInfo: DebugInfo,
    public readonly renderer: Renderer,
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
    const deltaTime = now - this.then;
    if (deltaTime > 0) {
      this.timeAccumulator += deltaTime;
      if (this.frameCount === 60) {
        const averageFrameTime = this.timeAccumulator / this.frameCount;
        this.fps = 1000 / averageFrameTime;
        this.frameCount = 0;
        this.timeAccumulator = 0;
      }
      this.then = now;
      this.frameCount++;
      this.renderer.draw();
      this.debugInfo.update(this.fps);
    }
    if (this.isRunning === true) {
      this.animationFrameId = requestAnimationFrame(this.boundLoop);
    }
  }
}

export const mainLoopService = registerService({
  async provider(resolver: ServiceResolver): Promise<MainLoop> {
    const [debugInfo, renderer] = await Promise.all([
      resolver.resolve(debugInfoService),
      resolver.resolve(rendererService),
    ]);
    return new MainLoop(debugInfo, renderer);
  },
});
