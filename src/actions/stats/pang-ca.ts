import { CAHandler } from "../../common/communication/action/define.ts";
import { registerCADefinition } from "../../common/communication/action/manager.ts";
import { Identifier } from "../../common/vars.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";

export interface PangCA {
  serverHighResTimestamp: number;
}

const codec: BinaryBYOBCodec<PangCA> = {
  calcByteLength(): number {
    return 8;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): PangCA {
    const dv = new DataView(buffer, byteOffset);
    const serverHighResTimestamp = dv.getFloat64(0, true);
    return { serverHighResTimestamp };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: PangCA): void {
    const { serverHighResTimestamp } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setFloat64(0, serverHighResTimestamp, true);
  },
};

export const pangCADef = registerCADefinition({
  encoding: {
    codec,
    key: Identifier.pangCA,
    type: "binary",
  },
  kind: "pang",
});

export class PangCAHandler implements CAHandler<PangCA, void> {
  async handle(request: PangCA): Promise<void> {
    // TODO: implement
  }
}

export function providePangCAHandler() {
  return new PangCAHandler();
}
