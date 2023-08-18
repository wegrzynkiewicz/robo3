import { GAHandler } from "../../core/action/processor.ts";
import { ServiceResolver, registerService } from "../../core/dependency/service.ts";
import { ChunksUpdateGA } from "../../domain/chunk/chunksUpdateGA.ts";
import { chunkManagerService } from "./chunkManager.ts";

export const chunksUpdateGAHandlerService = registerService({
  async provider(resolver: ServiceResolver) {
    const chunkManager = await resolver.resolve(chunkManagerService);
    const chunksUpdateGAHandler: GAHandler<ChunksUpdateGA, void> = {
      async handle(request: ChunksUpdateGA): Promise<void> {
        const { chunks } = request;
        for (const chunk of chunks) {
          chunkManager.register(chunk);
        }
      },
    };
    return chunksUpdateGAHandler;
  },
});
