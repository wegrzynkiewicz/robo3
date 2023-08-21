import { GAHandler } from "../../core/action/processor.ts";
import { registerService, ServiceResolver } from "../../core/dependency/service.ts";
import { ChunksUpdateGA } from "../../domain/chunk/chunksUpdateGA.ts";
import { chunkManagerService } from "./chunkManager.ts";

export const chunksUpdateGAHandlerService = registerService({
  async provider(resolver: ServiceResolver) {
    const chunkManager = await resolver.resolve(chunkManagerService);
    const chunksUpdateGAHandler: GAHandler<ChunksUpdateGA, void> = {
      async handle(request: ChunksUpdateGA): Promise<void> {
        const { chunks } = request;
        for (const chunk of chunks) {
          chunkManager.update(chunk);
        }
      },
    };
    return chunksUpdateGAHandler;
  },
});
