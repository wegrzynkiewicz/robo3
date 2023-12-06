import { GAHandler } from "../../core/action/processor.ts";
import { ServiceResolver } from "../../dependency/service.ts";
import { ChunkSegmentUpdateGA } from "../../domain/chunk/chunkSegmentUpdateGA.ts";
import { provideChunkManager } from "./chunkManager.ts";

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
