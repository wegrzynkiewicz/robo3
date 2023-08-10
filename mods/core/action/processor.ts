import { Breaker } from "../../common/asserts.ts";
import { GAConversation, GADefinition, GAEnvelope, GANotification } from "./foundation.ts";

export interface GANotificationHandler<TNotification> {
  handle: (notification: TNotification) => Promise<void>;
}
export type UnknownGANotificationHandler = GANotificationHandler<unknown>;

export class GANotificationProcessor {
  public handlers = new WeakMap<GADefinition, UnknownGANotificationHandler>();

  public registerHandler<TNotification>(
    definition: GANotification<TNotification>,
    handler: GANotificationHandler<TNotification>,
  ) {
    this.handlers.set(definition, handler as UnknownGANotificationHandler);
  }

  public async process<TNotification>(
    definition: GANotification<TNotification>,
    envelope: GAEnvelope<TNotification>,
  ): Promise<void> {
    const handler = this.handlers.get(definition);
    if (!handler) {
      throw new Breaker("game-action-notification-handler-not-found", { definition, envelope });
    }
    try {
      await handler.handle(envelope.params);
    } catch (error) {
      throw new Breaker("error-inside-game-action-notification-handler", { definition, envelope, error });
    }
  }
}

export interface GARequestHandler<TRequest, TResponse> {
  handle: (request: TRequest) => Promise<TResponse>;
}
export type UnknownGARequestHandler = GARequestHandler<unknown, unknown>;

export class GARequestProcessor {
  public handlers = new WeakMap<GADefinition, UnknownGARequestHandler>();

  public registerHandler<TRequest, TResponse>(
    definition: GAConversation<TRequest, TResponse>,
    handler: GARequestHandler<TRequest, TResponse>,
  ) {
    this.handlers.set(definition, handler as UnknownGARequestHandler);
  }

  public async process<TRequest, TResponse>(
    definition: GAConversation<TRequest, TResponse>,
    envelope: GAEnvelope<TRequest>,
  ): Promise<TResponse> {
    const handler = this.handlers.get(definition);
    if (!handler) {
      throw new Breaker("game-action-request-handler-not-found", { definition, envelope });
    }
    try {
      const params = await handler.handle(envelope.params);
      return params as TResponse;
    } catch (error) {
      throw new Breaker("error-inside-game-action-request-handler", { definition, envelope, error });
    }
  }
}

export class GAProcessor {
  public readonly notification = new GANotificationProcessor();
  public readonly request = new GARequestProcessor();
}
