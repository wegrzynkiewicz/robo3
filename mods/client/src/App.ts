import { ServiceResolver } from "../../dependency/service.ts";
import { spaceManagerService } from "../../core/space/SpaceManager.ts";
import { debugInfoService } from "./debug/DebugInfo.ts";
import { keyboardService } from "./keyboard/Keyboard.ts";
import { kaManagerService } from "./keyboard/foundation.ts";

export function provideApp(resolver: ServiceResolver) {
  const app: Record<string, unknown> = {
    debugInfo: resolver.resolve(provideDebugInfo),
    kaManager: resolver.resolve(provideKaManager),
    keyboard: resolver.resolve(provideKeyboard),
    spaceManager: resolver.resolve(provideSpaceManager),
  };
  return app;
}
