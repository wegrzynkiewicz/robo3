import { Breaker } from "../../../common/asserts.ts";
import { registerService,ServiceResolver } from "../../../core/dependency/service.ts";
import { debugInfoOpenKA } from "../debug/shortcuts.ts";
import { KAHandler, universalKAHandlerService } from "./KAHandler.ts";
import { KADefinition } from "./foundation.ts";

export class KAProcessor {
  public handlers = new Map<KADefinition, KAHandler>();

  public registerHandler(definition: KADefinition, handler: KAHandler): void {
    this.handlers.set(definition, handler);
  }

  public async process(definition: KADefinition): Promise<void> {
    const handler = this.handlers.get(definition);
    if (!handler) {
      throw new Breaker("keyboard-handler-not-found", { definition });
    }
    try {
      await handler.handle(definition);
    } catch (error) {
      throw new Breaker("error-inside-keyboard-action-handler", { definition, error });
    }
  }
}

export const kaProcessorService = registerService({
  async provider(resolve: ServiceResolver): Promise<KAProcessor> {
    const universalKAHandler = await resolve.resolve(universalKAHandlerService);
    const processor = new KAProcessor();
    processor.registerHandler(debugInfoOpenKA, universalKAHandler);
    return processor;
  },
});
