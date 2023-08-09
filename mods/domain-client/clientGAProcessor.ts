import { GANotificationHandler, GAProcessor } from "../core/action/processor.ts";
import { registerService } from "../core/dependency/service.ts";
import { ChunksUpdateGA, chunksUpdateGADef } from "../domain/chunk/chunksUpdateGA.ts";
import { chunksUpdateGAHandler } from "./chunk/chunksUpdateGAHandler.ts";

export const clientGAProcessor = registerService({
  dependencies: {
    chunksUpdateGAHandler,
  },
  provider: async (
    { chunksUpdateGAHandler }: {
      chunksUpdateGAHandler: GANotificationHandler<ChunksUpdateGA>,
    }
  ) => {
    const processor = new GAProcessor();
    const { notification } = processor;
    notification.registerHandler(chunksUpdateGADef, chunksUpdateGAHandler);
    return processor;
  },
});
