import { Framer } from './looper.ts';

export class FPSCounter implements Framer {
  public fps = 0;
  public deltaTime = 0;
  protected frameCount = 0;
  protected then = 0;
  protected timeAccumulator = 0;

  public frame(now: DOMHighResTimeStamp) {
    this.deltaTime = now - this.then;
    this.timeAccumulator += this.deltaTime;
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

export function provideFPSCounter() {
  return new FPSCounter();
}
