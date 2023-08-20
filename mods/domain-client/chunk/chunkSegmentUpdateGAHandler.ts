import { GAHandler } from "../../core/action/processor.ts";
import { registerService, ServiceResolver } from "../../core/dependency/service.ts";
import { ChunkSegmentUpdateGA } from "../../domain/chunk/chunkSegmentUpdateGA.ts";

export const chunkSegmentUpdateGAHandlerService = registerService({
  async provider(resolver: ServiceResolver) {
    const chunkSegmentUpdateGAHandler: GAHandler<ChunkSegmentUpdateGA, void> = {
      async handle(request: ChunkSegmentUpdateGA): Promise<void> {
        console.log(request);
      },
    };
    return chunkSegmentUpdateGAHandler;
  },
});
