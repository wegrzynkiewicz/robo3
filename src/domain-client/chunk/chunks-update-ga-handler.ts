import { CAHandler } from "../../common/communication/action/define.ts";
import { ChunksUpdateCA } from "../../domain/chunk/chunks-update-ga.ts";

export function provideChunksUpdateCAHandler() {
  const chunksUpdateCAHandler: CAHandler<ChunksUpdateCA, void> = {
    async handle(_request: ChunksUpdateCA): Promise<void> {
      // nothing
    },
  };
  return chunksUpdateCAHandler;
}
