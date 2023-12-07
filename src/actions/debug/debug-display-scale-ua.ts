import { ServiceResolver } from "../../common/dependency/service.ts";
import { Display, provideDisplay } from "../../apps/game-client/graphic/display.ts";
import { KeyShortCut, KeyState } from "../../apps/game-client/keyboard/key-short-cut.ts";
import { registerKADefinition } from "../../apps/game-client/keyboard/foundation.ts";
import { registerUADefinition, UADefinition } from "../../apps/game-client/ua/foundation.ts";
import { UAHandler } from "../../apps/game-client/ua/processor.ts";
import { debugKeyShortCut } from "./common.ts";

export const debugDisplayScaleUA = registerUADefinition<number>({
  name: "ua.debug.display-scale",
});

export const debugDisplayScaleKAs = [1, 2, 3].map((data) => {
  return registerKADefinition({
    name: `ka.debug.display-scale.${data}`,
    shortCuts: [
      new KeyShortCut(
        ...debugKeyShortCut,
        new KeyState("KeyV"),
        new KeyState(`Digit${data}`),
      ),
    ],
    ua: {
      data,
      definition: debugDisplayScaleUA,
    },
  });
});

export class DebugDisplayScaleUAHandler implements UAHandler<number> {
  public constructor(
    protected display: Display,
  ) {}

  public async handle(_definition: UADefinition<number>, data: number): Promise<void> {
    this.display.setScale(data);
  }
}

export function provideDebugDisplayScaleUAHandler(resolver: ServiceResolver) {
  return new DebugDisplayScaleUAHandler(
    resolver.resolve(provideDisplay),
  );
}
