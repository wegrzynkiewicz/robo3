import { GAHandler } from "../../core/action/processor.ts";
import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { ChunkSegmentUpdateGA } from "../../domain/chunk/chunkSegmentUpdateGA.ts";
import { chunkManagerService } from "./chunkManager.ts";

export const chunkSegmentUpdateGAHandlerService = registerService({
  name: "chunkSegmentUpdateGAHandler",
  async provider(resolver: ServiceResolver) {
    const chunkManager = await resolver.resolve(chunkManagerService);
    const chunkSegmentUpdateGAHandler: GAHandler<ChunkSegmentUpdateGA, void> = {
      async handle(request: ChunkSegmentUpdateGA): Promise<void> {
        const { chunkId, segment } = request;
        chunkManager.updateSegment(chunkId, segment);
      },
    };
    return chunkSegmentUpdateGAHandler;
  },
});
