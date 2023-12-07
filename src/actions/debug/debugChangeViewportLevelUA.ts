import { ServiceResolver } from "../../common/dependency/service.ts";
import { Viewport, provideViewport } from "../../apps/game-client/graphic/Viewport.ts";
import { KeyShortCut, KeyState } from "../../apps/game-client/keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../../apps/game-client/keyboard/foundation.ts";
import { registerUADefinition, UADefinition } from "../../apps/game-client/ua/foundation.ts";
import { UAHandler } from "../../apps/game-client/ua/processor.ts";

export const debugChangeViewportLevelUA = registerUADefinition<null>({
  name: "ua.debug.change-viewport-level",
});

const keys = [
  { data: +1, key: "KeyQ", name: "inc" },
  { data: -1, key: "KeyZ", name: "dec" },
];

export const debugChangeViewportLevelKAs = keys.map(({ data, key, name }) => {
  return registerKADefinition({
    name: `ka.debug.${name}-viewport-level`,
    shortCuts: [
      new KeyShortCut(
        new KeyState(key),
      ),
    ],
    ua: {
      data,
      definition: debugChangeViewportLevelUA,
    },
  });
});

export class DebugChangeViewportLevelUAHandler implements UAHandler<number> {
  public constructor(
    private viewport: Viewport,
  ) {}

  public async handle(_definition: UADefinition<number>, data: number): Promise<void> {
    this.viewport.level = this.viewport.level + data;
  }
}

export function provideDebugChangeViewportLevelUAHandler(resolver: ServiceResolver) {
  return new DebugChangeViewportLevelUAHandler(
    resolver.resolve(provideViewport),
  );
}
