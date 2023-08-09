import { Breaker } from "../../common/asserts.ts";
import { GAEnvelopeNotification, GAEnvelopeRequest } from "./foundation.ts";

export interface GANotificationHandler<TNotification> {
  handle: (notification: TNotification) => Promise<void>;
}
export type UnknownGANotificationHandler = GANotificationHandler<Record<string, unknown>>;

export interface GARequestHandler<TRequest, TResponse> {
  handle: (request: TRequest) => Promise<TResponse>;
}
export type UnknownGARequestHandler = GARequestHandler<Record<string, unknown>, Record<string, unknown>>;

export class GAProcessor implements GAProcessor {

  public constructor(
    public notificationHandlers: Map<string, UnknownGANotificationHandler>,
    public requestHandlers: Map<string, UnknownGARequestHandler>,
  ) {
  }

  public async processRequest(request: GAEnvelopeRequest): Promise<Record<string, unknown>> {
    const handler = this.requestHandlers.get(request.code);
    if (handler === undefined) {
      throw new Breaker("game-action-request-handler-not-found", { request });
    }
    try {
      const params = await handler.handle(request.params);
      return params === undefined ? {} : params;
    } catch (error) {
      throw new Breaker('error-inside-action-handler', { request, error });
    }
  }

  public async processNotification(notification: GAEnvelopeNotification): Promise<void> {
    const handler = this.notificationHandlers.get(notification.code);
    if (handler === undefined) {
      throw new Breaker("game-action-notification-handler-not-found", { notification });
    }
    try {
      await handler.handle(notification.params);
    } catch (error) {
      throw new Breaker('error-inside-action-handler', { notification, error });
    }
  }
}
