import { Breaker } from "../../common/asserts.ts";
import { AnyGADefinition, GADefinition } from "./foundation.ts";

export interface GAProcessor {
  canProcess<TData>(definition: GADefinition<TData>, envelope: TData): boolean;
  process<TData>(definition: GADefinition<TData>, envelope: TData): Promise<void>;
}

export interface GAHandler<TData> {
  handle(envelope: TData): Promise<void>;
}

export type AnyGAHandler = GAHandler<any>;

export class UniversalGAProcessor implements GAProcessor {
  public handlers = new WeakMap<AnyGADefinition, AnyGAHandler>();

  public registerHandler<TData>(
    definition: GADefinition<TData>,
    handler: GAHandler<TData>,
  ) {
    this.handlers.set(definition, handler as AnyGAHandler);
  }

  public canProcess<TData>(definition: GADefinition<TData>): boolean {
    return this.handlers.has(definition);
  }

  public async process<TData>(definition: GADefinition<TData>, envelope: TData): Promise<void> {
    const handler = this.handlers.get(definition);
    if (!handler) {
      throw new Breaker("game-action-handler-not-found", { definition, envelope });
    }
    try {
      await handler.handle(envelope);
    } catch (error) {
      throw new Breaker("error-inside-game-action-handler", { definition, envelope, error });
    }
  }
}
