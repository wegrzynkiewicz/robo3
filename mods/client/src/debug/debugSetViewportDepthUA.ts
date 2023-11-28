import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { Viewport, viewportService } from "../graphic/Viewport.ts";
import { KeyShortCut, KeyState } from "../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";
import { registerUADefinition, UADefinition } from "../ua/foundation.ts";
import { UAHandler } from "../ua/processor.ts";

export const debugSetViewportDepthUA = registerUADefinition<null>({
  name: "ua.debug.set-viewport-depth",
});

const keys = [
  { data: +1, key: "KeyQ", name: "inc" },
  { data: -1, key: "KeyZ", name: "dec" },
];

for (const { data, key, name } of keys) {
  registerKADefinition({
    name: `ka.debug.${name}-viewport-depth`,
    shortCuts: [
      new KeyShortCut(
        new KeyState(key),
      ),
    ],
    ua: {
      definition: debugSetViewportDepthUA,
      data,
    },
  });
}

export class DebugSetViewportDepthUAHandler implements UAHandler<number> {
  public constructor(
    private viewport: Viewport,
  ) { }

  public async handle(_definition: UADefinition<number>, data: number): Promise<void> {
    this.viewport.level = this.viewport.level + data;
  }
}

export const debugSetViewportDepthUAHandlerService = registerService({
  async provider(resolver: ServiceResolver): Promise<UAHandler<number>> {
    return new DebugSetViewportDepthUAHandler(
      await resolver.resolve(viewportService)
    );
  },
});
