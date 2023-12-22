import { GADefinition, GAEnvelope } from "./define.ts";

export interface QueueItem<TData> {
  definition: GADefinition<TData>;
  envelope: GAEnvelope<TData>;
}

export type AnyQueueItem = QueueItem<any>;

export class GAIncomingQueue {
  protected queue: AnyQueueItem[] = [];

  public push<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>) {
    this.queue.push({definition, envelope});
  }

  public shift(gaCount: number): AnyQueueItem[] {
    return this.queue.splice(0, gaCount);
  }
}

export function provideGAIncomingQueue() {
  return new GAIncomingQueue();
}
