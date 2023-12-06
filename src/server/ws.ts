import { Breaker } from "../common/utils/breaker.ts";
import { Logger } from "../common/utils/logger.ts";
import { GAReceiver, provideGAReceiver } from "../common/action/receiver.ts";
import { provideWebSocket } from "../common/action/sender.ts";
import { provideGlobalLogger } from "../core/logger.ts";
import { ServiceResolver } from "../common/dependency/service.ts";

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
    resolver.resolve(provideGAReceiver),
    resolver.resolve(provideWebSocket),
  );
}
