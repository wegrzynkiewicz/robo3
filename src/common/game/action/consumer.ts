import { ServiceResolver } from "../../dependency/service.ts";
import { Looper } from "../looper.ts";
import { GABus, provideUnprocessedGABus } from "./bus.ts";
import { GAIncomingQueue, provideGAIncomingQueue } from "./incoming-queue.ts";

export class GAConsumer implements Looper {
  protected batchCount = 1024;
  public constructor(
    protected readonly bus: GABus,
    protected readonly queue: GAIncomingQueue,
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

export function provideGAConsumer(resolver: ServiceResolver) {
  return new GAConsumer(
    resolver.resolve(provideUnprocessedGABus),
    resolver.resolve(provideGAIncomingQueue),
  );
}
