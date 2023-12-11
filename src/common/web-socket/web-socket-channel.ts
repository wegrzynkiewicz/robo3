import { provideScopedWebSocket } from "../action/socket.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { Logger, provideScopedLogger } from "../logger/global.ts";
import { BasicWebSocketChannelBus } from "./web-socket-channel-bus.ts";

export class WebSocketChannel {

  public readonly openBus = new BasicWebSocketChannelBus();
  public readonly closeBus = new BasicWebSocketChannelBus();
  public readonly messageBus = new BasicWebSocketChannelBus();
  public readonly errorBus = new BasicWebSocketChannelBus();

  public constructor(
    public readonly logger: Logger,
    public readonly ws: WebSocket,
  ) { 
    ws.addEventListener("open", async (event: Event) => {
      try {
        await this.openBus.dispatch(event);
      } catch (error) {
        this.logger.error("error-inside-web-socket-channel-open-listener", { error });
      }
    });

    ws.addEventListener("close", async (event: CloseEvent) => {
      try {
        await this.closeBus.dispatch(event);
      } catch (error) {
        this.logger.error("error-inside-web-socket-channel-close-listener", { error });
      }
    });

    ws.addEventListener("message", async (event: MessageEvent) => {
      try {
        await this.messageBus.dispatch(event);
      } catch (error) {
        this.logger.error("error-inside-web-socket-channel-message-listener", { error });
      }
    });

    ws.addEventListener("error", async (event: Event) => {
      try {
        await this.errorBus.dispatch(event);
      } catch (error) {
        this.logger.error("error-inside-web-socket-channel-error-listener", { error });
      }
    });
  }

  public close(): void {
    this.ws.close();
  }
}

export function provideScopedWebSocketChannel(resolver: ServiceResolver) {
  return new WebSocketChannel(
    resolver.resolve(provideScopedLogger),
    resolver.resolve(provideScopedWebSocket),
  )
}
