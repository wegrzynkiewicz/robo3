import { Breaker } from "../../../common/asserts.ts";
import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { UAProcessor, uaProcessorService } from "../ua/processor.ts";
import { Keyboard, keyboardService } from "./Keyboard.ts";
import { AnyKADefinition } from "./foundation.ts";

export interface KAShortCutChecker {
  checkKAShortCuts(processor: KAProcessor): Promise<void>;
}

export class KAProcessor {
  public constructor(
    public readonly keyboard: Keyboard,
    public readonly uaProcessor: UAProcessor,
  ) {}

  public async process(definition: AnyKADefinition) {
    const sequence = this.keyboard.cloneSequence();
    for (const shortcut of definition.currentShortCuts) {
      if (shortcut.match(sequence)) {
        this.keyboard.clearSequence();
        await this.handle(definition);
        return;
      }
    }
  }

  protected async handle(kaDefinition: AnyKADefinition) {
    const { ua } = kaDefinition;
    if (ua === undefined) {
      throw new Breaker("not-found-ua-definition-in-ka-definition", { kaDefinition });
    }
    const { definition, data } = ua;
    try {
      await this.uaProcessor.process(definition, data);
    } catch (error) {
      throw new Breaker("error-in-ka-processor", { error, kaDefinition, ua });
    }
  }
}

export const kaProcessorService = registerService({
  name: "kaProcessor",
  async provider(resolver: ServiceResolver): Promise<KAProcessor> {
    return new KAProcessor(
      await resolver.resolve(keyboardService),
      await resolver.resolve(uaProcessorService),
    );
  },
});
