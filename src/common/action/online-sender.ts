import { ServiceResolver } from "../dependency/service.ts";
import { GACodec, provideGACodec } from "./codec.ts";
import { Logger, provideScopedLogger } from "../logger/global.ts";
import { provideScopedWebSocket } from "./socket.ts";
import { GADefinition, GAEnvelope, GASender } from "./define.ts";

export class OnlineGASender implements GASender {
  public constructor(
    public readonly codec: GACodec,
    public readonly logger: Logger,
    public readonly ws: WebSocket,
  ) {}

  public send<TData>(definition: GADefinition<TData>, params: TData): void {
    const { kind } = definition;
    const envelope: GAEnvelope<TData> = { id: 0, kind, params };
    this.sendEnvelope(definition, envelope);
  }

  public sendEnvelope<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): void {
    const encodedData = this.codec.encode(definition, envelope);
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

export function provideScopedGASender(resolver: ServiceResolver) {
  return new OnlineGASender(
    resolver.resolve(provideGACodec),
    resolver.resolve(provideScopedLogger),
    resolver.resolve(provideScopedWebSocket),
  );
}
