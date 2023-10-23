import { GAHandler } from "../../core/action/processor.ts";
import { registerService, ServiceResolver } from "../../core/dependency/service.ts";
import { spaceManagerService } from "../../core/space/SpaceManager.ts";
import { ChunkSegmentUpdateGA } from "../../domain/chunk/chunkSegmentUpdateGA.ts";

export const chunkSegmentUpdateGAHandlerService = registerService({
  async provider(resolver: ServiceResolver) {
    const spaceManager = await resolver.resolve(spaceManagerService);
    const chunkSegmentUpdateGAHandler: GAHandler<ChunkSegmentUpdateGA, void> = {
      async handle(request: ChunkSegmentUpdateGA): Promise<void> {
        const { chunkId, segment } = request;
        const { spaceId } = chunkId;
        const space = spaceManager.obtain(spaceId);
        space.chunkManager.updateSegment(chunkId, segment);
      },
    };
    return chunkSegmentUpdateGAHandler;
  },
});
