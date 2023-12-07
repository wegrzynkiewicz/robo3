import { provideSpaceManager } from "../../common/space/space-manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { provideDebugInfo } from "./debug/debug-info.ts";
import { provideKeyboard } from "./keyboard/keyboard.ts";
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
