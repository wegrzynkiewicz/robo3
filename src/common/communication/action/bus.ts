import { CADefinition, CAEnvelope } from "./define.ts";

export interface CABusSubscriber {
  subscribe<TData>(definition: CADefinition<TData>, data: CAEnvelope<TData>): Promise<void>;
}

export interface CABus {
  dispatch<TData>(definition: CADefinition<TData>, data: CAEnvelope<TData>): Promise<void>;
}

export class BasicCABus implements CABus {
  public readonly subscribers = new Set<CABusSubscriber>();
  public async dispatch<TData>(definition: CADefinition<TData>, data: CAEnvelope<TData>): Promise<void> {
    for (const subscriber of this.subscribers) {
      subscriber.subscribe(definition, data);
    }
  }
}

export class ForwardingCABus extends BasicCABus implements CABus, CABusSubscriber {
  public async subscribe<TData>(definition: CADefinition<TData>, data: CAEnvelope<TData>): Promise<void> {
    return this.dispatch(definition, data);
  }
}

export function provideMainCABus() {
  return new BasicCABus();
}

export function provideReceivingCABus() {
  return new BasicCABus();
}

export function provideSendingCABus() {
  return new ForwardingCABus();
}
