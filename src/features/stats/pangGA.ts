import { registerGADefinition } from "../../common/action/foundation.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";

export interface PangGA {
  serverHighResTimestamp: number;
}

const codec: BinaryBYOBCodec<PangGA> = {
  calcByteLength(): number {
    return 8;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): PangGA {
    const dv = new DataView(buffer, byteOffset);
    const serverHighResTimestamp = dv.getFloat64(0, true);
    return { serverHighResTimestamp };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: PangGA): void {
    const { serverHighResTimestamp } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setFloat64(0, serverHighResTimestamp, true);
  },
};

export const pangGADef = registerGADefinition({
  encoding: {
    codec,
    type: "binary",
  },
  kind: "pang",
  key: 0x03,
});
