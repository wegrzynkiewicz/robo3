import { ServiceResolver } from "../dependency/service.ts";
import { CACodec, provideCACodec } from "./codec.ts";
import { Logger, provideScopedLogger } from "../logger/global.ts";
import { provideScopedWebSocket } from "./socket.ts";
import { CADefinition, CAEnvelope } from "./define.ts";
import { CABusSubscriber } from "./bus.ts";

export class OnlineCASender implements CABusSubscriber {
  public constructor(
    public readonly codec: CACodec,
    public readonly logger: Logger,
    public readonly ws: WebSocket,
  ) {}

  public async subscribe<TData>(definition: CADefinition<TData>, data: CAEnvelope<TData>): Promise<void> {
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

export function provideScopedOnlineCASender(resolver: ServiceResolver) {
  return new OnlineCASender(
    resolver.resolve(provideCACodec),
    resolver.resolve(provideScopedLogger),
    resolver.resolve(provideScopedWebSocket),
  );
}
