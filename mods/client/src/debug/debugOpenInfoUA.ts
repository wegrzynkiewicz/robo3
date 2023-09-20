import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { KeyState, KeyShortCut } from "../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";
import { registerUADefinition } from "../ua/foundation.ts";
import { UAHandler } from "../ua/processor.ts";
import { debugInfoService } from "./DebugInfo.ts";
import { debugKeyShortCut } from "./common.ts";

export const debugOpenInfoUA = registerUADefinition<null>({
  name: 'ua.debug.open-info',
});

export const debugOpenInfoKA = registerKADefinition({
  name: 'ka.debug.open-info',
  shortCuts: [
    new KeyShortCut(
      ...debugKeyShortCut,
      new KeyState('KeyI')
    ),
  ],
  ua: {
    definition: debugOpenInfoUA,
    data: null,
  },
});

export const debugOpenInfoUAHandlerService = registerService({
  async provider(resolver: ServiceResolver): Promise<UAHandler<null>> {
    const debugInfo = await resolver.resolve(debugInfoService);
    const handle = async (): Promise<void> => {
      debugInfo.toggle();
    };
    return { handle };
  },
});
