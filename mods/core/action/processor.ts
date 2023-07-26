import { Breaker } from "../../common/asserts.ts";
import { Container, injectIntoScopedContainer, registerService } from "../dependency/service.ts";
import { GameActionNotification, GameActionRequest } from "./foundation.ts";
import { loginGAHandler } from "./handlers/login.ts";

export interface GameActionProcessor {
  processRequest(request: GameActionRequest): Promise<Record<string, unknown>>;
  processNotification(notification: GameActionNotification): Promise<void>;
}

export interface GameActionNotificationHandler {
  handle: (scopedContainer: Container, request: GameActionNotification) => Promise<void>;
}

export interface GameActionRequestHandler {
  handle: (scopedContainer: Container, request: GameActionRequest) => Promise<Record<string, unknown>>;
}

export class ClientGameActionProcessor implements GameActionProcessor {
  protected readonly notificationHandlers: Map<string, GameActionNotificationHandler>;
  protected readonly requestHandlers: Map<string, GameActionRequestHandler>;

  public constructor(
    { scopedContainer, notificationHandlers, requestHandlers }: {
      scopedContainer: Container;
      notificationHandlers: Map<string, GameActionNotificationHandler>;
      requestHandlers: Map<string, GameActionRequestHandler>;
    },
  ) {
    this.notificationHandlers = notificationHandlers;
    this.requestHandlers = requestHandlers;
  }

  public async processRequest(action: GameActionRequest): Promise<Record<string, unknown>> {
    const handler = this.requestHandlers.get(action.request);
    if (handler === undefined) {
      throw new Breaker("game-action-request-handler-not-found", { action });
    }
    const params = await handler.handle();
    return params;
  }
  public processNotification(notification: GameActionNotification): Promise<void> {
  }
}

registerService({
  dependencies: {
    scopedContainer: 1,
  },
  provider: async (
    { scopedContainer }: {
      scopedContainer: Container;
    },
  ) => {
    const notificationHandlers = new Map<string, GameActionNotificationHandler>();
    const requestHandlers = new Map<string, GameActionRequestHandler>();

    const processor = new ClientGameActionProcessor({ notificationHandlers, requestHandlers });
    return processor;
  },
});

injectIntoScopedContainer({ clientGameActionProcessor });
