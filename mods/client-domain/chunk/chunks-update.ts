import { GameActionNotification } from "../../core/action/foundation.ts";
import { GameActionNotificationHandler } from "../../core/action/processor.ts";
import { ChunkManager } from "../../core/chunk/chunk.ts";
import { ChunksUpdateGameActionParams } from "../../core/chunk/chunks-update.ts";
import { registerService } from "../../core/dependency/service.ts";
import { chunkManager } from "./chunk-manager.ts";

async function provider(
  { chunkManager }: {
    chunkManager: ChunkManager;
  },
) {
  const chunksUpdateGAHandler: GameActionNotificationHandler = {
    async handle(notification: GameActionNotification): Promise<void> {
      const { chunks } = notification.params as unknown as ChunksUpdateGameActionParams;
      for (const chunk of chunks) {
        chunkManager.register(chunk);
      }
    },
  };
  return chunksUpdateGAHandler;
}

export const chunksUpdateGAHandler = registerService({
  dependencies: {
    chunkManager,
  },
  provider,
});
