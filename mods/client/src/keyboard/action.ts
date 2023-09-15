import { Breaker } from "../../../common/asserts.ts";
import { registerService } from "../../../core/dependency/service.ts";
import { KADefinition } from "./manager.ts";

export interface KAHandler {
  handle(definition: KADefinition, event: KeyboardEvent): Promise<void>
}

export class UniversalKAHandler implements KAHandler {
  public async handle(definition: KADefinition, event: KeyboardEvent): Promise<void> {
    console.log({ definition, event });
  }
}

export class KAProcessor {
  public handlers = new Map<KADefinition, KAHandler>();

  public registerHandler(definition: KADefinition, handler: KAHandler): void {
    this.handlers.set(definition, handler);
  }

  public async process(definition: KADefinition, event: KeyboardEvent): Promise<void> {
    const handler = this.handlers.get(definition);
    if (!handler) {
      throw new Breaker("keyboard-handler-not-found", { definition });
    }
    try {
      await handler.handle(definition, event);
    } catch (error) {
      throw new Breaker("error-inside-keyboard-action-handler", { definition, error });
    }
  }
}

export const universalKAHandlerService = registerService({
  async provider(): Promise<UniversalKAHandler> {
    return new UniversalKAHandler();
  },
});
