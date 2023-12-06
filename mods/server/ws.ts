import { Breaker } from "../common/breaker.ts";
import { Logger } from "../common/logger.ts";
import { GAReceiver, gaReceiverService } from "../core/action/receiver.ts";
import { webSocketService } from "../core/action/sender.ts";
import { globalLoggerService } from "../core/logger.ts";
import { ServiceResolver } from "../dependency/service.ts";

export class ClientChannel {
  public constructor(
    public readonly logger: Logger,
    public readonly receiver: GAReceiver,
    public readonly ws: WebSocket,
  ) {}

  public attachListeners(): void {
    const { ws } = this;

    ws.addEventListener("open", () => {
      console.log("open");
    });

    ws.addEventListener("close", () => {
      console.log("close");
    });

    ws.addEventListener("message", async (event) => {
      try {
        await this.receiver.receive(event.data);
      } catch (error) {
        this.logger.error("error-when-processing-wss-message", { error });
        ws.close(4001, error instanceof Breaker ? error.message : "unknown-error");
      }
    });

    ws.addEventListener("error", (event) => {
      console.log("error", event);
    });
  }

  public close(): void {
    this.ws.close();
  }
}

export function provideClientChannel(resolver: ServiceResolver) {
  return new ClientChannel(
    resolver.resolve(provideGlobalLogger),
    resolver.resolve(provideGaReceiver),
    resolver.resolve(provideWebSocket),
  );
}
