import { GAHandler, UniversalGAProcessor } from "../core/action/processor.ts";
import { registerService } from "../core/dependency/service.ts";
import { ChunksUpdateGA, chunksUpdateGADef } from "../domain/chunk/chunksUpdateGA.ts";
import { chunksUpdateGAHandler } from "./chunk/chunksUpdateGAHandler.ts";

export const clientGAProcessor = registerService({
  dependencies: {
    chunksUpdateGAHandler,
  },
  globalKey: 'clientGAProcessor', 
  provider: async (
    { chunksUpdateGAHandler }: {
      chunksUpdateGAHandler: GAHandler<ChunksUpdateGA>;
    },
  ) => {
    const processor = new UniversalGAProcessor();
    processor.registerHandler(chunksUpdateGADef, chunksUpdateGAHandler);
    return processor;
  },
});
