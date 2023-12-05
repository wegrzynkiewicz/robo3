import { Breaker } from "../../../common/asserts.ts";
import { registerService } from "../../../dependency/service.ts";
import { UADefinition } from "./foundation.ts";

export interface UABusSubscriber {
  subscribe<TData>(definition: UADefinition<TData>, data: TData): Promise<void>;
}

export interface UABus {
  dispatch<TData>(definition: UADefinition<TData>, data: TData): Promise<void>
}

export class MainUABus implements UABus {
  public readonly subscribers = new Set<UABusSubscriber>();
  public async dispatch<TData>(definition: UADefinition<TData>, data: TData): Promise<void> {
    for (const subscriber of this.subscribers) {
      try {
        await subscriber.subscribe(definition, data);
      } catch (error) {
        throw new Breaker('error-inside-ua-subscriber', { definition, data, error });
      }
    }
  }
}

export const mainUABusService = registerService({
  name: "mainUABus",
  async provider(): Promise<MainUABus> {
    return new MainUABus();;
  },
});
