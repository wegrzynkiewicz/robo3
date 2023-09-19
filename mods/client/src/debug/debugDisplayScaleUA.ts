import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { displayService } from "../graphic/Display.ts";
import { KeyState, KeyShortCut } from "../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";
import { UADefinition, registerUADefinition } from "../ua/foundation.ts";
import { UAHandler } from "../ua/processor.ts";
import { debugKeyShortCut } from "./common.ts";

export const debugDisplayScaleUA = registerUADefinition<number>({
  name: 'ua.debug.display-scale',
});

for (const data of [1, 2, 3]) {
  registerKADefinition({
    name: `ka.debug.display-scale.${data}`,
    shortCuts: [
      new KeyShortCut(
        ...debugKeyShortCut,
        new KeyState('KeyS'),
        new KeyState(`Digit${data}`),
      ),
    ],
    ua: {
      definition: debugDisplayScaleUA,
      data,
    },
  });
}

export const debugDisplayScaleUAHandlerService = registerService({
  async provider(resolver: ServiceResolver): Promise<UAHandler<number>> {
    const [display] = await Promise.all([
      resolver.resolve(displayService),
    ]);
    const handle = async (_definition: UADefinition<number>, data: number): Promise<void> => {
      display.scale = data;
    };
    return { handle };
  },
});
