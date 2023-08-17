import { Breaker } from "../../common/asserts.ts";
import { GADefinition } from "./foundation.ts";

export interface GASender {
  send<TData>(definition: GADefinition<TData>, data: TData): void;
}

export class OnlineGASender implements GASender {

  public constructor(
    public readonly ws: WebSocket,
  ) {
  }

  public send<TData>(definition: GADefinition<TData>, data: TData): void {
    const encodedData = definition.codec.encode(data);
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
