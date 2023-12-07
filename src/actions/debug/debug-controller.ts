import { KAMatcher, KAShortCutsChecker } from "../../apps/game-client/keyboard/kamatcher.ts";
import { debugChangeViewportLevelKAs } from "./debug-change-viewport-level-ua.ts";
import { debugDisplayScaleKAs } from "./debug-display-scale-ua.ts";
import { debugOpenInfoKA } from "./debug-open-info-ua.ts";
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
