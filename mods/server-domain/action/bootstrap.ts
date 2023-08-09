import { GANotificationHandler,GARequestHandler,UniversalGAProcessor } from "../../core/action/processor.ts";
import { registerService } from "../../core/dependency/service.ts";
import { loginGAHandler } from "../login.ts";

export const notificationHandlers = registerService({
  provider: async () => {
    return new Map<string, GANotificationHandler>();
  },
});

export const requestHandlers = registerService({
  dependencies: {
    loginGAHandler,
  },
  provider: async (
    { loginGAHandler }: {
      loginGAHandler: GARequestHandler;
    },
  ) => {
    return new Map<string, GARequestHandler>([
      ["login", loginGAHandler],
    ]);
  },
});

export const serverGAProcessor = registerService({
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
