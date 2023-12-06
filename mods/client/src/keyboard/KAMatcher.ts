import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { KABus, mainKABusService } from "./KABus.ts";
import { Keyboard, keyboardService } from "./Keyboard.ts";
import { AnyKADefinition } from "./foundation.ts";

export interface KAShortCutsChecker {
  checkKAShortCuts(checker: KAMatcher): Promise<void>;
}

export class KAMatcher {
  public constructor(
    public readonly keyboard: Keyboard,
    public readonly kaBus: KABus,
  ) {}

  public async match(definition: AnyKADefinition) {
    const sequence = this.keyboard.cloneSequence();
    for (const shortcut of definition.currentShortCuts) {
      if (shortcut.match(sequence)) {
        this.keyboard.clearSequence();
        await this.kaBus.dispatch(definition);
        return;
      }
    }
  }
}

export function provideKAMatcher(resolver: ServiceResolver) {
  return new KAMatcher(
    resolver.resolve(provideKeyboard),
    resolver.resolve(provideMainKABus),
  );
}
