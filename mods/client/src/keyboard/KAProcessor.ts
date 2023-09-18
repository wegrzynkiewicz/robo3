import { Breaker } from "../../../common/asserts.ts";
import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { UAProcessor, uaProcessorService } from "../ua/processor.ts";
import { KADefinition } from "./foundation.ts";

export class KAProcessor {

  public constructor(
    public readonly uaProcessor: UAProcessor,
  ) {

  }

  public async process<TData>(kaDefinition: KADefinition<TData>): Promise<void> {
    const {definition, data} = kaDefinition.ua;
    try {
      this.uaProcessor.process(definition, data);
    } catch (error) {
      throw new Breaker('error-in-ka-processor', { error, kaDefinition, definition });
    }
  }
}

export const kaProcessorService = registerService({
  async provider(resolver: ServiceResolver): Promise<KAProcessor> {
    const [uaProcessor] = await Promise.all([
      resolver.resolve(uaProcessorService),
    ]);
    return new KAProcessor(uaProcessor);
  },
});
