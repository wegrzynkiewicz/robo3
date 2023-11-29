import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { spaceManagerService } from "../../core/space/SpaceManager.ts";
import { debugInfoService } from "./debug/DebugInfo.ts";
import { keyboardService } from "./keyboard/Keyboard.ts";
import { kaManagerService } from "./keyboard/foundation.ts";

export const appService = registerService({
  name: "app",
  async provider(resolver: ServiceResolver): Promise<unknown> {
    const app: Record<string, unknown> = {
      debugInfo: await resolver.resolve(debugInfoService),
      kaManager: await resolver.resolve(kaManagerService),
      keyboard: await resolver.resolve(keyboardService),
      spaceManager: await resolver.resolve(spaceManagerService),
    };
    return app;
  },
  singleton: true,
});
