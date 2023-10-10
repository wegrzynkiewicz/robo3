export class PerformanceCounter {
  protected accumulator = 0;
  protected counter = 0;
  protected startTime = 0;
  protected readonly startMark: string;
  protected readonly endMark: string;
  public value = 0;

  public constructor(
    public readonly name: string,
    public readonly frequency: number,
  ) {
    this.startMark = `start-${this.name}`;
    this.endMark = `end-${this.name}`;
  }

  public start() {
    this.startTime = performance.now();
    performance.mark(this.startMark);
  }

  public end() {
    const endTime = performance.now();
    performance.mark(this.endMark);
    performance.measure(this.name, this.startMark, this.endMark);
    const diff = endTime - this.startTime;
    this.accumulator += diff;
    this.counter++;
    if (this.counter > this.frequency) {
      this.value = this.accumulator / this.frequency;
      this.accumulator = 0;
      this.counter = 0;
    }
  }
}
