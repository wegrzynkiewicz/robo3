import { ServiceResolver } from "../dependency/service.ts";
import { Looper } from "../game/looper.ts";
import { JABus, provideUnprocessedJABus } from "./bus.ts";
import { JAIncomingQueue, provideJAIncomingQueue } from "./incoming-queue.ts";

export class JAConsumer implements Looper {
  protected batchCount = 1024;
  public constructor(
    protected readonly bus: JABus,
    protected readonly queue: JAIncomingQueue,
  ) { }

  public loop(): void {
    this.consume();
  }

  public setBatchCount(batchCount: number): void {
    this.batchCount = batchCount;
  }

  public consume(): void {
    const items = this.queue.shift(this.batchCount);
    for (const { definition, envelope } of items) {
      this.bus.dispatch(definition, envelope);
    }
  }
}

export function provideJAConsumer(resolver: ServiceResolver) {
  return new JAConsumer(
    resolver.resolve(provideUnprocessedJABus),
    resolver.resolve(provideJAIncomingQueue),
  );
}
