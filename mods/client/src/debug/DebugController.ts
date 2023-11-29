import { registerService } from "../../../dependency/service.ts";
import { KAProcessor, KAShortCutChecker } from "../keyboard/KAProcessor.ts";
import { debugChangeViewportLevelKAs } from "./actions/debugChangeViewportLevelUA.ts";
import { debugDisplayScaleKAs } from "./actions/debugDisplayScaleUA.ts";
import { debugOpenInfoKA } from "./actions/debugOpenInfoUA.ts";
import { debugSwitchFreeCameraKA } from "./actions/debugSwitchFreeCamera.ts";

export class DebugController implements KAShortCutChecker {
  public async checkKAShortCuts(processor: KAProcessor): Promise<void> {
    for (const kaDefinition of debugDisplayScaleKAs) {
      await processor.process(kaDefinition);
    }
    for (const kaDefinition of debugChangeViewportLevelKAs) {
      await processor.process(kaDefinition);
    }
    await processor.process(debugOpenInfoKA);
    await processor.process(debugSwitchFreeCameraKA);
  }
}

export const debugControllerService = registerService({
  name: "debugController",
  async provider(): Promise<DebugController> {
    return new DebugController();
  },
});
