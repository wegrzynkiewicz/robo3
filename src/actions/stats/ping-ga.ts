import { CAHandler } from "../../common/action/define.ts";
import { registerCADefinition } from "../../common/action/manager.ts";
import { Identifier } from "../../common/vars.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";
import { PongCA } from "./pong-ga.ts";

export interface PingCA {
  clientHighResTimestamp: number;
}

const codec: BinaryBYOBCodec<PingCA> = {
  calcByteLength(): number {
    return 8;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): PingCA {
    const dv = new DataView(buffer, byteOffset);
    const clientHighResTimestamp = dv.getFloat64(0, true);
    return { clientHighResTimestamp };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: PingCA): void {
    const { clientHighResTimestamp } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setFloat64(0, clientHighResTimestamp, true);
  },
};

export const pingCADef = registerCADefinition({
  encoding: {
    codec,
    key: Identifier.pingCA,
    type: "binary",
  },
  kind: "ping",
});

export class PingCAHandler implements CAHandler<PingCA, PongCA> {
  async handle(request: PingCA): Promise<PongCA> {
    const { clientHighResTimestamp } = request;
    const serverHighResTimestamp = performance.now();
    const response = { clientHighResTimestamp, serverHighResTimestamp };
    return response;
  }
}

export function providePingCAHandler() {
  return new PingCAHandler();
}
