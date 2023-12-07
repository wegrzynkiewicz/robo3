import { KAMatcher, KAShortCutsChecker } from "../../apps/game-client/keyboard/KAMatcher.ts";
import { debugChangeViewportLevelKAs } from "./debugChangeViewportLevelUA.ts";
import { debugDisplayScaleKAs } from "./debugDisplayScaleUA.ts";
import { debugOpenInfoKA } from "./debugOpenInfoUA.ts";
import { debugSwitchFreeCameraKA } from "./debug.switch-free-camera.ts";

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
