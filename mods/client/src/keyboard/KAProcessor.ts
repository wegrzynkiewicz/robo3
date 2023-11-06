import { Breaker } from "../../../common/asserts.ts";
import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { UAProcessor, uaProcessorService } from "../ua/processor.ts";
import { KADefinition } from "./foundation.ts";

export class KAProcessor {
  public constructor(
    public readonly uaProcessor: UAProcessor,
  ) {}

  public async process<TData>(kaDefinition: KADefinition<TData>): Promise<void> {
    if (kaDefinition.ua) {
      const { definition, data } = kaDefinition.ua;
      try {
        this.uaProcessor.process(definition, data);
      } catch (error) {
        throw new Breaker("error-in-ka-processor", { error, kaDefinition, definition });
      }
    }
  }
}

export const kaProcessorService = registerService({
  async provider(resolver: ServiceResolver): Promise<KAProcessor> {
    return new KAProcessor(
      await resolver.resolve(uaProcessorService),
    );
  },
});
