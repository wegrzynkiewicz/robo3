import { GAHandler } from "../../core/action/processor.ts";
import { ChunkManager } from "../../core/chunk/chunk.ts";
import { registerService } from "../../core/dependency/service.ts";
import { ChunksUpdateGA } from "../../domain/chunk/chunksUpdateGA.ts";
import { chunkManager } from "./chunkManager.ts";

async function provider(
  { chunkManager }: {
    chunkManager: ChunkManager;
  },
) {
  const chunksUpdateGAHandler: GAHandler<ChunksUpdateGA, void> = {
    async handle(notification: ChunksUpdateGA): Promise<void> {
      const { chunks } = notification;
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
  globalKey: 'chunksUpdateGAHandler', 
  provider,
});
