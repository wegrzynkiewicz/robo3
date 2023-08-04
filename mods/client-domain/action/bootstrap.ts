import { GameActionNotificationHandler, GameActionRequestHandler, UniversalGameActionProcessor } from "../../core/action/processor.ts";
import { registerService } from "../../core/dependency/service.ts";
import { chunksUpdateGAHandler } from "../chunk/chunks-update.ts";

export const notificationHandlers = registerService({
  dependencies: {
    chunksUpdateGAHandler,
  },
  provider: async (
    { chunksUpdateGAHandler }: {
      chunksUpdateGAHandler: GameActionNotificationHandler;
    },
  ) => {
    return new Map<string, GameActionNotificationHandler>([
      ["chunks-update", chunksUpdateGAHandler],
    ]);
  },
});

export const requestHandlers = registerService({
  dependencies: {},
  provider: async () => {
    return new Map<string, GameActionRequestHandler>();
  },
});

export const clientGameActionProcessor = registerService({
  dependencies: {
    notificationHandlers,
    requestHandlers,
  },
  provider: async (
    { notificationHandlers, requestHandlers }: {
      notificationHandlers: Map<string, GameActionNotificationHandler>;
      requestHandlers: Map<string, GameActionRequestHandler>;
    },
  ) => {
    const processor = new UniversalGameActionProcessor({ notificationHandlers, requestHandlers });
    return processor;
  },
});
