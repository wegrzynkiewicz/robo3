import { JADefinition, JAEnvelope } from "./define.ts";

export interface QueueItem<TData> {
  definition: JADefinition<TData>;
  envelope: JAEnvelope<TData>;
}

export type AnyQueueItem = QueueItem<any>;

export class JAIncomingQueue {
  protected queue: AnyQueueItem[] = [];

  public push<TData>(definition: JADefinition<TData>, envelope: JAEnvelope<TData>) {
    this.queue.push({definition, envelope});
  }

  public shift(JACount: number): AnyQueueItem[] {
    return this.queue.splice(0, JACount);
  }
}

export function provideJAIncomingQueue() {
  return new JAIncomingQueue();
}
