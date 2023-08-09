import { GANotificationHandler, GARequestHandler, UniversalGAProcessor } from "../../core/action/processor.ts";
import { registerService } from "../../core/dependency/service.ts";
import { chunksUpdateGAHandler } from "../chunk/chunks-update.ts";

export const notificationHandlers = registerService({
  dependencies: {
    chunksUpdateGAHandler,
  },
  provider: async (
    { chunksUpdateGAHandler }: {
      chunksUpdateGAHandler: GANotificationHandler;
    },
  ) => {
    return new Map<string, GANotificationHandler>([
      ["chunks-update", chunksUpdateGAHandler],
    ]);
  },
});

export const requestHandlers = registerService({
  dependencies: {},
  provider: async () => {
    return new Map<string, GARequestHandler>();
  },
});

export const clientGAProcessor = registerService({
  dependencies: {
    notificationHandlers,
    requestHandlers,
  },
  provider: async (
    { notificationHandlers, requestHandlers }: {
      notificationHandlers: Map<string, GANotificationHandler>;
      requestHandlers: Map<string, GARequestHandler>;
    },
  ) => {
    const processor = new UniversalGAProcessor({ notificationHandlers, requestHandlers });
    return processor;
  },
});
