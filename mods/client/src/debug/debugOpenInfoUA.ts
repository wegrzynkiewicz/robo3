import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { KeyState, KeyShortCut } from "../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";
import { registerUADefinition } from "../ua/foundation.ts";
import { UAHandler } from "../ua/processor.ts";
import { debugInfoService } from "./DebugInfo.ts";

const common = [
  new KeyState("KeyV", true),
];

export const debugOpenInfoKA = registerKADefinition({
  name: 'debug.open-info',
  shortCuts: [
    new KeyShortCut(...common, new KeyState('KeyI')),
  ],
});

export const debugOpenInfoUA = registerUADefinition<null>({
  name: 'debug.open-info',
});

export const debugOpenInfoUAHandlerService = registerService({
  async provider(resolver: ServiceResolver): Promise<UAHandler<null>> {
    const [debugInfo] = await Promise.all([
      resolver.resolve(debugInfoService),
    ]);
    const handle = async (): Promise<void> => {
      debugInfo.toggle();
    };
    return { handle };
  },
});
