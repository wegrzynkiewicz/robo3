import { GANotification } from "../../core/action/foundation.ts";
import { GANotificationHandler } from "../../core/action/processor.ts";
import { ChunkManager } from "../../core/chunk/chunk.ts";
import { registerService } from "../../core/dependency/service.ts";
import { chunkManager } from "./chunk-manager.ts";

async function provider(
  { chunkManager }: {
    chunkManager: ChunkManager;
  },
) {
  const chunksUpdateGAHandler: GANotificationHandler = {
    async handle(notification: GANotification): Promise<void> {
    //   const { chunks } = notification.params as unknown as ChunksUpdateGAParams;
    //   for (const chunk of chunks) {
    //     chunkManager.register(chunk);
    //   }
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
