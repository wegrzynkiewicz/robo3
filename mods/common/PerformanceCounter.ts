class MeasurePerformanceCounter implements PerformanceCounter {
  protected accumulator = 0;
  protected counter = 0;
  protected startTime = 0;
  protected readonly startMark: string;
  protected readonly endMark: string;
  public avgTime = 0;

  public constructor(
    public readonly name: string,
    public readonly frequency: number,
  ) {
    this.startMark = `start-${name}`;
    this.endMark = `end-${name}`;
  }

  public start(): void {
    this.startTime = performance.now();
    performance.mark(this.startMark);
  }

  public end(): void {
    const endTime = performance.now();
    performance.mark(this.endMark);
    performance.measure(this.name, this.startMark, this.endMark);
    const diff = endTime - this.startTime;
    this.accumulator += diff;
    this.counter++;
    if (this.counter === this.frequency) {
      this.avgTime = this.accumulator / this.frequency;
      this.accumulator = 0;
      this.counter = 0;
    }
  }
}

class NullPerformanceCounter implements PerformanceCounter {
  public readonly avgTime = 0;
  public start(): void {}
  public end(): void {}
}

export interface PerformanceCounter {
  avgTime: number;
  start(): void;
  end(): void;
}

export function createPerformanceCounter(name: string, frequency: number): PerformanceCounter {
  if (true) {
    return new MeasurePerformanceCounter(name, frequency);
  } else {
    return new NullPerformanceCounter();
  }
}
