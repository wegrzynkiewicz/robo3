import { Looper } from "./looper.ts";

export class Ticker implements Looper {
  private accumulator = 0;
  private tickCount = 0;
  
  public constructor(
    private readonly tickInterval: number,
    private readonly handler: Looper,
  ) { }

  public loop(deltaTime: number): void {
    if (this.tickCount % this.tickInterval === 0) {
      this.handler.loop(this.accumulator);
      this.accumulator = 0;
    }
    this.tickCount++;
    this.accumulator += deltaTime;
  }
}
