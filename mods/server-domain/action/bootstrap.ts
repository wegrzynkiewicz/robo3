import { GameActionNotificationHandler,GameActionRequestHandler,UniversalGameActionProcessor } from "../../core/action/processor.ts";
import { registerService } from "../../core/dependency/service.ts";
import { loginGAHandler } from "../login.ts";

export const notificationHandlers = registerService({
  provider: async () => {
    return new Map<string, GameActionNotificationHandler>();
  },
});

export const requestHandlers = registerService({
  dependencies: {
    loginGAHandler,
  },
  provider: async (
    { loginGAHandler }: {
      loginGAHandler: GameActionRequestHandler;
    },
  ) => {
    return new Map<string, GameActionRequestHandler>([
      ["login", loginGAHandler],
    ]);
  },
});

export const serverGameActionProcessor = registerService({
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
