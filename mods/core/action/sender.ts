import { Breaker } from "../../common/asserts.ts";
import { logger } from "../../common/logger.ts";
import { registerService, ServiceResolver } from "../dependency/service.ts";
import { GACodec, gaCodecService, GAEnvelope } from "./codec.ts";
import { GADefinition } from "./foundation.ts";

export interface GASender {
  send<TData>(definition: GADefinition<TData>, data: TData): void;
  sendEnvelope<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): void;
  sendRaw(data: string | ArrayBuffer): void;
}

export class OnlineGASender implements GASender {
  public constructor(
    public readonly codec: GACodec,
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
      logger.error("ws-not-open", { readyState });
      return;
    }
    ws.send(data);
    // TODO: process WS
  }
}

export const gaSenderWebSocketService = registerService({
  async provider(): Promise<WebSocket> {
    throw new Breaker("sender-websocket-service-should-be-injected");
  },
});

export const gaSenderService = registerService({
  async provider(resolver: ServiceResolver): Promise<GASender> {
    return new OnlineGASender(
      await resolver.resolve(gaCodecService),
      await resolver.resolve(gaSenderWebSocketService),
    );
  },
});
