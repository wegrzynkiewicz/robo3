import { Breaker } from "../../../common/asserts.ts";
import { ServiceResolver, registerService } from "../../../core/dependency/service.ts";
import { UAManager, uaManagerService } from "../ua/foundation.ts";
import { UAProcessor, uaProcessorService } from "../ua/processor.ts";
import { KADefinition } from "./foundation.ts";

export interface KAHandler {
  handle(definition: KADefinition): Promise<void>
}

export class UniversalKAHandler implements KAHandler {
  public constructor(
    public readonly uaManager: UAManager,
    public readonly uaProcessor: UAProcessor,
  ) {

  }

  public async handle(kaDefinition: KADefinition): Promise<void> {
    const uaDefinition = this.uaManager.byName.get(kaDefinition.name);
    if (!uaDefinition) {
      throw new Breaker('not-found-ua-definition-by-ka-definition', { kaDefinition });
    }
    try {
      this.uaProcessor.process(uaDefinition, null);
    } catch (error) {
      throw new Breaker('error-in-ua-processor', { error, kaDefinition, uaDefinition });
    }
  }
}

export const universalKAHandlerService = registerService({
  async provider(resolver: ServiceResolver): Promise<UniversalKAHandler> {
    const [uaManager, uaProcessor] = await Promise.all([
      resolver.resolve(uaManagerService),
      resolver.resolve(uaProcessorService),
    ]);
    return new UniversalKAHandler(uaManager, uaProcessor);
  },
});
