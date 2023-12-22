import { JADefinition, JAEnvelope } from "./define.ts";

export interface JABusSubscriber {
  subscribe<TData>(definition: JADefinition<TData>, data: JAEnvelope<TData>): Promise<void>;
}

export interface JABus {
  dispatch<TData>(definition: JADefinition<TData>, data: JAEnvelope<TData>): Promise<void>;
}

export class BasicJABus implements JABus {
  public readonly subscribers = new Set<JABusSubscriber>();
  public async dispatch<TData>(definition: JADefinition<TData>, data: JAEnvelope<TData>): Promise<void> {
    for (const subscriber of this.subscribers) {
      subscriber.subscribe(definition, data);
    }
  }
}

export function provideUnprocessedJABus() {
  return new BasicJABus();
}
