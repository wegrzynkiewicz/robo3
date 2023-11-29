import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { Viewport, viewportService } from "../../graphic/Viewport.ts";
import { KeyShortCut, KeyState } from "../../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../../keyboard/foundation.ts";
import { registerUADefinition, UADefinition } from "../../ua/foundation.ts";
import { UAHandler } from "../../ua/processor.ts";

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
  ) { }

  public async handle(_definition: UADefinition<number>, data: number): Promise<void> {
    this.viewport.level = this.viewport.level + data;
  }
}

export const debugChangeViewportLevelUAHandlerService = registerService({
  name: 'debugChangeViewportLevelUAHandler',
  async provider(resolver: ServiceResolver): Promise<UAHandler<number>> {
    return new DebugChangeViewportLevelUAHandler(
      await resolver.resolve(viewportService)
    );
  },
});