import { provideSpaceManager } from "../../core/space/SpaceManager.ts";
import { ServiceResolver } from "../../dependency/service.ts";
import { provideDebugInfo } from "./debug/DebugInfo.ts";
import { provideKeyboard } from "./keyboard/Keyboard.ts";
import { provideKAManager } from "./keyboard/foundation.ts";

export function provideApp(resolver: ServiceResolver) {
  const app: Record<string, unknown> = {
    debugInfo: resolver.resolve(provideDebugInfo),
    kaManager: resolver.resolve(provideKAManager),
    keyboard: resolver.resolve(provideKeyboard),
    spaceManager: resolver.resolve(provideSpaceManager),
  };
  return app;
}
