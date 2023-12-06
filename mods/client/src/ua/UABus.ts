import { Breaker } from "../../../common/breaker.ts";

import { UADefinition } from "./foundation.ts";

export interface UABusSubscriber {
  subscribe<TData>(definition: UADefinition<TData>, data: TData): Promise<void>;
}

export interface UABus {
  dispatch<TData>(definition: UADefinition<TData>, data: TData): Promise<void>;
}

export class MainUABus implements UABus {
  public readonly subscribers = new Set<UABusSubscriber>();
  public async dispatch<TData>(definition: UADefinition<TData>, data: TData): Promise<void> {
    for (const subscriber of this.subscribers) {
      try {
        await subscriber.subscribe(definition, data);
      } catch (error) {
        throw new Breaker("error-inside-ua-subscriber", { definition, data, error });
      }
    }
  }
}

export function provideMainUABus() {
  return new MainUABus();
}
