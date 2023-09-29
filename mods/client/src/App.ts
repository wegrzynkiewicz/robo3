import { registerService,ServiceResolver } from "../../core/dependency/service.ts";
import { chunkManagerService } from "../../domain-client/chunk/chunkManager.ts";
import { keyboardService } from "./keyboard/Keyboard.ts";
import { kaManagerService } from "./keyboard/foundation.ts";

export const appService = registerService({
  async provider(resolver: ServiceResolver): Promise<unknown> {
    const app: Record<string, unknown> = {
      chunkManager: await resolver.resolve(chunkManagerService),
      kaManager: await resolver.resolve(kaManagerService),
      keyboard: await resolver.resolve(keyboardService),
    };
    return app;
  },
  singleton: true,
});
