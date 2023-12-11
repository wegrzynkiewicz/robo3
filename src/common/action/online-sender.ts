import { ServiceResolver } from "../dependency/service.ts";
import { GACodec, provideGACodec } from "./codec.ts";
import { Logger, provideScopedLogger } from "../logger/global.ts";
import { provideScopedWebSocket } from "./socket.ts";
import { GADefinition, GAEnvelope } from "./define.ts";
import { GABusSubscriber } from "./bus.ts";

export class OnlineGASender implements GABusSubscriber {
  public constructor(
    public readonly codec: GACodec,
    public readonly logger: Logger,
    public readonly ws: WebSocket,
  ) {}

  public async subscribe<TData>(definition: GADefinition<TData>, data: GAEnvelope<TData>): Promise<void> {
    const encodedData = this.codec.encode(definition, data);
    this.sendRaw(encodedData);
  }

  public sendRaw(data: string | ArrayBuffer): void {
    const { ws } = this;
    const { readyState } = ws;
    if (readyState !== ws.OPEN) {
      this.logger.error("ws-not-open", { readyState });
      return;
    }
    ws.send(data);
    // TODO: process WS
  }
}

export function provideScopedOnlineGASender(resolver: ServiceResolver) {
  return new OnlineGASender(
    resolver.resolve(provideGACodec),
    resolver.resolve(provideScopedLogger),
    resolver.resolve(provideScopedWebSocket),
  );
}
