import { registerGADefinition } from "../../common/action/manager.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";

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
    type: "binary",
  },
  kind: "ping",
  key: 0x01,
});
