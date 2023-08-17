import { GAHandler, UniversalGAProcessor } from "../core/action/processor.ts";
import { GASender } from "../core/action/sender.ts";
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
      chunksUpdateGAHandler: GAHandler<ChunksUpdateGA, void>;
    },
    { sender }: {
      sender: GASender,
    }
  ) => {
    const processor = new UniversalGAProcessor(sender);
    processor.registerHandler(chunksUpdateGADef, undefined, chunksUpdateGAHandler);
    return processor;
  },
});
