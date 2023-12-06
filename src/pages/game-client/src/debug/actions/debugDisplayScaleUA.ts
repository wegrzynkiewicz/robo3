import { ServiceResolver } from "../../../../../common/dependency/service.ts";
import { Display, provideDisplay } from "../../graphic/Display.ts";
import { KeyShortCut, KeyState } from "../../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../../keyboard/foundation.ts";
import { registerUADefinition, UADefinition } from "../../ua/foundation.ts";
import { UAHandler } from "../../ua/processor.ts";
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
