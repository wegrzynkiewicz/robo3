import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { Display, displayService } from "../graphic/Display.ts";
import { KeyShortCut, KeyState } from "../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";
import { registerUADefinition, UADefinition } from "../ua/foundation.ts";
import { UAHandler } from "../ua/processor.ts";
import { debugKeyShortCut } from "./common.ts";

export const debugDisplayScaleUA = registerUADefinition<number>({
  name: "ua.debug.display-scale",
});

for (const data of [1, 2, 3]) {
  registerKADefinition({
    name: `ka.debug.display-scale.${data}`,
    shortCuts: [
      new KeyShortCut(
        ...debugKeyShortCut,
        new KeyState("KeyS"),
        new KeyState(`Digit${data}`),
      ),
    ],
    ua: {
      definition: debugDisplayScaleUA,
      data,
    },
  });
}

export class DebugDisplayScaleUAHandler implements UAHandler<number> {
  public constructor(
    protected display: Display,
  ) { }

  public async handle(_definition: UADefinition<number>, data: number): Promise<void> {
    this.display.setScale(data);
  }
}

export const debugDisplayScaleUAHandlerService = registerService({
  async provider(resolver: ServiceResolver): Promise<DebugDisplayScaleUAHandler> {
    return new DebugDisplayScaleUAHandler(
      await resolver.resolve(displayService),
    );
  },
});
