import { Breaker } from "../utils/breaker.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { GACodec, GAEnvelope, provideGACodec } from "./codec.ts";
import { GADefinition } from "./foundation.ts";
import { Logger, provideGlobalLogger } from "../logger/logger.ts";

export interface GASender {
  send<TData>(definition: GADefinition<TData>, data: TData): void;
  sendEnvelope<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): void;
  sendRaw(data: string | ArrayBuffer): void;
}

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

export function provideWebSocket(): WebSocket {
  throw new Breaker("websocket-service-should-be-injected");
}

export function provideGASender(resolver: ServiceResolver) {
  return new OnlineGASender(
    resolver.resolve(provideGACodec),
    resolver.resolve(provideGlobalLogger),
    resolver.resolve(provideWebSocket),
  );
}
