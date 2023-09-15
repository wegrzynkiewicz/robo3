import { Breaker } from "../../../common/asserts.ts";
import { registerService,ServiceResolver } from "../../../core/dependency/service.ts";
import { debugOpenInfoUA,debugOpenInfoUAHandlerService } from "../debug/debugOpenInfoUA.ts";
import { AnyUADefinition, UADefinition } from "./foundation.ts";

export interface UAHandler<TData> {
  handle(definition: UADefinition<TData>, data: TData): Promise<void>
}

export type AnyUAHandler = UAHandler<any>;

export class UAProcessor {
  public handlers = new Map<AnyUADefinition, AnyUAHandler>();

  public registerHandler<TData>(definition: UADefinition<TData>, handler: UAHandler<TData>): void {
    this.handlers.set(definition, handler);
  }

  public async process<TData>(definition: UADefinition<TData>, data: TData): Promise<void> {
    const handler = this.handlers.get(definition);
    if (!handler) {
      throw new Breaker("keyboard-handler-not-found", { definition });
    }
    try {
      await handler.handle(definition, data);
    } catch (error) {
      throw new Breaker("error-inside-keyboard-action-handler", { definition, error });
    }
  }
}

export const uaProcessorService = registerService({
  async provider(resolver: ServiceResolver): Promise<UAProcessor> {
    const processor = new UAProcessor();
    processor.registerHandler(debugOpenInfoUA, await resolver.resolve(debugOpenInfoUAHandlerService))
    return processor;
  },
});
