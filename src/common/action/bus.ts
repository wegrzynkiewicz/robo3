import { GADefinition, GAEnvelope } from "./define.ts";

export interface GABusSubscriber {
  subscribe<TData>(definition: GADefinition<TData>, data: GAEnvelope<TData>): Promise<void>;
}

export interface GABus {
  dispatch<TData>(definition: GADefinition<TData>, data: GAEnvelope<TData>): Promise<void>;
}

export class BasicGABus implements GABus {
  public readonly subscribers = new Set<GABusSubscriber>();
  public async dispatch<TData>(definition: GADefinition<TData>, data: GAEnvelope<TData>): Promise<void> {
    for (const subscriber of this.subscribers) {
      subscriber.subscribe(definition, data);
    }
  }
}

export class ForwardingGABus extends BasicGABus implements GABus, GABusSubscriber {
  public async subscribe<TData>(definition: GADefinition<TData>, data: GAEnvelope<TData>): Promise<void> {
    return this.dispatch(definition, data);
  }
}

export function provideMainGABus() {
  return new BasicGABus();
}

export function provideScopedReceivingGABus() {
  return new BasicGABus();
}

export function provideScopedSendingGABus() {
  return new ForwardingGABus();
}
