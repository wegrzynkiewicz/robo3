import { GAHandler } from "../../common/action/processor.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { ChunkSegmentUpdateGA } from "../../domain/chunk/chunk-segment-update-ga.ts";
import { provideChunkManager } from "./chunk-manager.ts";

export function provideChunkSegmentUpdateGAHandler(resolver: ServiceResolver) {
  const chunkManager = resolver.resolve(provideChunkManager);
  const chunkSegmentUpdateGAHandler: GAHandler<ChunkSegmentUpdateGA, void> = {
    async handle(request: ChunkSegmentUpdateGA): Promise<void> {
      const { chunkId, segment } = request;
      chunkManager.updateSegment(chunkId, segment);
    },
  };
  return chunkSegmentUpdateGAHandler;
}
