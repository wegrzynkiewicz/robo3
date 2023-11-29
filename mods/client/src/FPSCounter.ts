import { registerService } from "../../dependency/service.ts";

export class FPSCounter {
  public fps = 0;
  protected frameCount = 0;
  protected then = 0;
  protected timeAccumulator = 0;

  public loop(now: DOMHighResTimeStamp) {
    const deltaTime = now - this.then;
    this.timeAccumulator += deltaTime;
    this.frameCount++;
    if (this.frameCount === 60) {
      const averageFrameTime = this.timeAccumulator / this.frameCount;
      this.fps = 1000 / averageFrameTime;
      this.frameCount = 0;
      this.timeAccumulator = 0;
    }
    this.then = now;
  }
}

export const fpsCounterService = registerService({
  name: "fpsCounter",
  async provider(): Promise<FPSCounter> {
    return new FPSCounter();
  },
});
