import { Breaker } from "../../common/asserts.ts";
import { GameActionNotification, GameActionRequest } from "./foundation.ts";

export interface GameActionProcessor {
  processRequest(request: GameActionRequest): Promise<Record<string, unknown>>;
  processNotification(notification: GameActionNotification): Promise<void>;
}

export interface GameActionNotificationHandler {
  handle: (request: GameActionNotification) => Promise<void>;
}

export interface GameActionRequestHandler {
  handle: (request: GameActionRequest) => Promise<Record<string, unknown>>;
}

export class UniversalGameActionProcessor implements GameActionProcessor {
  protected readonly notificationHandlers: Map<string, GameActionNotificationHandler>;
  protected readonly requestHandlers: Map<string, GameActionRequestHandler>;

  public constructor(
    { notificationHandlers, requestHandlers }: {
      notificationHandlers: Map<string, GameActionNotificationHandler>;
      requestHandlers: Map<string, GameActionRequestHandler>;
    },
  ) {
    this.notificationHandlers = notificationHandlers;
    this.requestHandlers = requestHandlers;
  }

  public async processRequest(action: GameActionRequest): Promise<Record<string, unknown>> {
    const handler = this.requestHandlers.get(action.code);
    if (handler === undefined) {
      throw new Breaker("game-action-request-handler-not-found", { action });
    }
    try {
      const params = await handler.handle(action);
      return params === undefined ? {} : params;
    } catch (error) {
      throw new Breaker('error-inside-action-handler', { action, error });
    }
  }

  public async processNotification(action: GameActionNotification): Promise<void> {
    const handler = this.notificationHandlers.get(action.code);
    if (handler === undefined) {
      throw new Breaker("game-action-notification-handler-not-found", { action });
    }
    try {
      await handler.handle(action);
    } catch (error) {
      throw new Breaker('error-inside-action-handler', { action, error });
    }
  }
}
