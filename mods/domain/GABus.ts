import { GADefinition } from "../core/action/foundation.ts";
import { registerService } from "../dependency/service.ts";

export interface GABusSubscriber {
  subscribe<TData>(definition: GADefinition<TData>, data: TData): Promise<void>;
}

export interface GABus {
  dispatch<TData>(definition: GADefinition<TData>, data: TData): Promise<void>;
}

export class MainGABus implements GABus {
  public readonly subscribers = new Set<GABusSubscriber>();
  public async dispatch<TData>(definition: GADefinition<TData>, data: TData): Promise<void> {
    for (const subscriber of this.subscribers) {
      subscriber.subscribe(definition, data);
    }
  }
}

export function provideMainGABus() {
  return new MainGABus();
}
