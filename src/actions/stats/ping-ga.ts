import { GAHandler } from "../../common/action/define.ts";
import { registerGADefinition } from "../../common/action/manager.ts";
import { Identifier } from "../../common/vars.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";
import { PongGA } from "./pong-ga.ts";

export interface PingGA {
  clientHighResTimestamp: number;
}

const codec: BinaryBYOBCodec<PingGA> = {
  calcByteLength(): number {
    return 8;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): PingGA {
    const dv = new DataView(buffer, byteOffset);
    const clientHighResTimestamp = dv.getFloat64(0, true);
    return { clientHighResTimestamp };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: PingGA): void {
    const { clientHighResTimestamp } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setFloat64(0, clientHighResTimestamp, true);
  },
};

export const pingGADef = registerGADefinition({
  encoding: {
    codec,
    key: Identifier.pingGA,
    type: "binary",
  },
  kind: "ping",
});

export class PingGAHandler implements GAHandler<PingGA, PongGA> {
  async handle(request: PingGA): Promise<PongGA> {
    const { clientHighResTimestamp } = request;
    const serverHighResTimestamp = performance.now();
    const response = { clientHighResTimestamp, serverHighResTimestamp };
    return response;
  }
}

export function providePingGAHandler() {
  return new PingGAHandler();
}
