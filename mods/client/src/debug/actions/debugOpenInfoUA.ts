import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { KeyShortCut, KeyState } from "../../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../../keyboard/foundation.ts";
import { registerUADefinition, UADefinition } from "../../ua/foundation.ts";
import { UAHandler } from "../../ua/processor.ts";
import { DebugInfo, debugInfoService } from "../DebugInfo.ts";
import { debugKeyShortCut } from "./common.ts";

export const debugOpenInfoUA = registerUADefinition<null>({
  name: "ua.debug.open-info",
});

export const debugOpenInfoKA = registerKADefinition({
  name: "ka.debug.open-info",
  shortCuts: [
    new KeyShortCut(
      ...debugKeyShortCut,
      new KeyState("KeyI"),
    ),
  ],
  ua: {
    data: null,
    definition: debugOpenInfoUA,
  },
});

export class DebugOpenInfoUAHandler implements UAHandler<null> {
  public constructor(
    protected debugInfo: DebugInfo,
  ) {}

  public async handle(_definition: UADefinition<null>, _data: null): Promise<void> {
    this.debugInfo.toggle();
  }
}

export const debugOpenInfoUAHandlerService = registerService({
  name: "debugOpenInfoUAHandler",
  async provider(resolver: ServiceResolver): Promise<UAHandler<null>> {
    return new DebugOpenInfoUAHandler(
      await resolver.resolve(debugInfoService),
    );
  },
});
