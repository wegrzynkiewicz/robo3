import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { KAProcessor, kaProcessorService } from "./KAProcessor.ts";
import { Keyboard, keyboardService } from "./Keyboard.ts";
import { AnyKADefinition } from "./foundation.ts";

export class KAShortCutProcessor {
  public constructor(
    public readonly keyboard: Keyboard,
    public readonly processor: KAProcessor,
  ) {}

  public process(definitions: AnyKADefinition[]) {
    const sequence = [...this.keyboard.sequence];
    for (const definition of definitions) {
      for (const shortcut of definition.currentShortCuts) {
        if (shortcut.match(sequence)) {
          this.processor.process(definition);
          this.keyboard.clearSequence();
        }
      }
    }
  }
}

export const kaShortCutProcessorService = registerService({
  async provider(resolver: ServiceResolver): Promise<KAShortCutProcessor> {
    return new KAShortCutProcessor(
      await resolver.resolve(keyboardService),
      await resolver.resolve(kaProcessorService),
    );
  },
});
