import { registerService } from "../../../dependency/service.ts";
import { KAMatcher, KAShortCutsChecker } from "../keyboard/KAMatcher.ts";
import { debugChangeViewportLevelKAs } from "./actions/debugChangeViewportLevelUA.ts";
import { debugDisplayScaleKAs } from "./actions/debugDisplayScaleUA.ts";
import { debugOpenInfoKA } from "./actions/debugOpenInfoUA.ts";
import { debugSwitchFreeCameraKA } from "./actions/debugSwitchFreeCamera.ts";

export class DebugController implements KAShortCutsChecker {
  public async checkKAShortCuts(matcher: KAMatcher): Promise<void> {
    for (const kaDefinition of debugDisplayScaleKAs) {
      await matcher.match(kaDefinition);
    }
    for (const kaDefinition of debugChangeViewportLevelKAs) {
      await matcher.match(kaDefinition);
    }
    await matcher.match(debugOpenInfoKA);
    await matcher.match(debugSwitchFreeCameraKA);
  }
}

export function provideDebugController() {
  return new DebugController();
}
