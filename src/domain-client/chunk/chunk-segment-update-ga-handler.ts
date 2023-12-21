import { CAHandler } from "../../common/action/define.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { ChunkSegmentUpdateCA } from "../../domain/chunk/chunk-segment-update-ga.ts";
import { provideChunkManager } from "./chunk-manager.ts";

export function provideChunkSegmentUpdateCAHandler(resolver: ServiceResolver) {
  const chunkManager = resolver.resolve(provideChunkManager);
  const chunkSegmentUpdateCAHandler: CAHandler<ChunkSegmentUpdateCA, void> = {
    async handle(request: ChunkSegmentUpdateCA): Promise<void> {
      const { chunkId, segment } = request;
      chunkManager.updateSegment(chunkId, segment);
    },
  };
  return chunkSegmentUpdateCAHandler;
}
