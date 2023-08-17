import { Breaker } from "../../common/asserts.ts";
import { GAEnvelope } from "./codec.ts";
import { GADefinition } from "./foundation.ts";

export interface GASender {
  send<TData>(definition: GADefinition<TData>, data: TData): void;
  sendRaw(data: string | ArrayBuffer): void
}

export class OnlineGASender implements GASender {

  public constructor(
    public readonly ws: WebSocket,
  ) {
  }

  public send<TData>(definition: GADefinition<TData>, params: TData): void {
    const { codec, kind } = definition;
    const envelope: GAEnvelope<TData> = { id: 0, kind, params };
    const encodedData = codec.encode(envelope);
    this.sendRaw(encodedData);
  }

  public sendRaw(data: string | ArrayBuffer): void {
    const { ws } = this;
    const { readyState } = ws;
    if (readyState !== ws.OPEN) {
      throw new Breaker("ws-not-open", { readyState });
    }
    ws.send(data);
    // TODO: process WS
  }
}
