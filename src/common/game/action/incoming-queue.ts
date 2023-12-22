import { AnyGAEnvelope } from "./define.ts";

export class GAIncomingQueue {
  protected queue: AnyGAEnvelope[] = [];

  public push(envelope: AnyGAEnvelope) {
    this.queue.push(envelope);
  }

  public shift(gaCount: number): AnyGAEnvelope[] {
    return this.queue.splice(0, gaCount);
  }
}

export function provideScopedGAIncomingQueue() {
  return new GAIncomingQueue();
}
