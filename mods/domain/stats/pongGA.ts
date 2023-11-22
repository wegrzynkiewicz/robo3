import { registerGADefinition } from "../../core/action/foundation.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";

export interface PongGA {
  clientHighResTimestamp: number;
  serverHighResTimestamp: number;
}

const codec: BinaryBYOBCodec<PongGA> = {
  calcByteLength(): number {
    return 8;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): PongGA {
    const dv = new DataView(buffer, byteOffset);
    const clientHighResTimestamp = dv.getFloat32(0, true);
    const serverHighResTimestamp = dv.getFloat32(4, true);
    return { clientHighResTimestamp, serverHighResTimestamp };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: PongGA): void {
    const { clientHighResTimestamp, serverHighResTimestamp } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setFloat32(0, clientHighResTimestamp, true);
    dv.setFloat32(4, serverHighResTimestamp, true);
  },
};

export const pongGADef = registerGADefinition({
  encoding: {
    codec,
    type: "binary",
  },
  kind: "pong",
  key: 0x02,
});
