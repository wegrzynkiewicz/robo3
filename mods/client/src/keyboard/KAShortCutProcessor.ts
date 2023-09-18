import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { KAProcessor, kaProcessorService } from "./KAProcessor.ts";
import { Keyboard, keyboardService } from "./Keyboard.ts";
import { KADefinition } from "./foundation.ts";

export class KAShortCutProcessor {
  public constructor(
    public readonly keyboard: Keyboard,
    public readonly processor: KAProcessor,
  ) {

  }
  
  public process(definitions: KADefinition<any>[]) {
    for (const definition of definitions) {
      for (const shortcut of definition.currentShortCuts) {
        if (shortcut.match(this.keyboard)) {
          this.processor.process(definition);
        }
      }
    }
  }
}

export const kaShortCutProcessorService = registerService({
  async provider(resolver: ServiceResolver): Promise<KAShortCutProcessor> {
    const [keyboard, processor] = await Promise.all([
      resolver.resolve(keyboardService),
      resolver.resolve(kaProcessorService),
    ]);
    return new KAShortCutProcessor(keyboard, processor);
  },
});
