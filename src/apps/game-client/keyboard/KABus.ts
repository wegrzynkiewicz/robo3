import { KADefinition } from "./foundation.ts";

export interface KABusSubscriber {
  subscribe<TData>(definition: KADefinition<TData>): Promise<void>;
}

export interface KABus {
  dispatch<TData>(definition: KADefinition<TData>): Promise<void>;
}

export class MainKABus implements KABus {
  public readonly subscribers = new Set<KABusSubscriber>();
  public async dispatch<TData>(definition: KADefinition<TData>): Promise<void> {
    for (const subscriber of this.subscribers) {
      await subscriber.subscribe(definition);
    }
  }
}

export function provideMainKABus() {
  return new MainKABus();
}
