import { registerGADefinition } from "../../core/action/foundation.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";

export interface PingGA {
  clientHighResTimestamp: number;
}

const codec: BinaryBYOBCodec<PingGA> = {
  calcByteLength(): number {
    return 4;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): PingGA {
    const dv = new DataView(buffer, byteOffset);
    const clientHighResTimestamp = dv.getFloat32(0, true);
    return { clientHighResTimestamp };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: PingGA): void {
    const { clientHighResTimestamp } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setFloat32(0, clientHighResTimestamp, true);
  },
};

export const pingGADef = registerGADefinition({
  encoding: {
    codec,
    type: "binary",
  },
  kind: "ping",
  key: 0x01,
});
