import { GAHandler } from "../../common/action/processor.ts";
import { ChunksUpdateGA } from "../../domain/chunk/chunks-update-ga.ts";

export function provideChunksUpdateGAHandler() {
  const chunksUpdateGAHandler: GAHandler<ChunksUpdateGA, void> = {
    async handle(_request: ChunksUpdateGA): Promise<void> {
      // nothing
    },
  };
  return chunksUpdateGAHandler;
}