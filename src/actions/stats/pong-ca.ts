import { CAHandler } from "../../common/communication/action/define.ts";
import { registerCADefinition } from "../../common/communication/action/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { Identifier } from "../../common/vars.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";
import { NetworkLatencyCounter, provideNetworkLatencyCounter } from "./network-latency-counter.ts";
import { PangCA } from "./pang-ca.ts";

export interface PongCA {
  clientHighResTimestamp: number;
  serverHighResTimestamp: number;
}

const codec: BinaryBYOBCodec<PongCA> = {
  calcByteLength(): number {
    return 16;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): PongCA {
    const dv = new DataView(buffer, byteOffset);
    const clientHighResTimestamp = dv.getFloat64(0, true);
    const serverHighResTimestamp = dv.getFloat64(8, true);
    return { clientHighResTimestamp, serverHighResTimestamp };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: PongCA): void {
    const { clientHighResTimestamp, serverHighResTimestamp } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setFloat64(0, clientHighResTimestamp, true);
    dv.setFloat64(8, serverHighResTimestamp, true);
  },
};

export const pongCADef = registerCADefinition({
  encoding: {
    codec,
    key: Identifier.pongCA,
    type: "binary",
  },
  kind: "pong",
});

export class PongCAHandler implements CAHandler<PongCA, PangCA> {
  public constructor(
    protected networkLatencyCounter: NetworkLatencyCounter,
  ) {}

  async handle(request: PongCA): Promise<PangCA> {
    const { clientHighResTimestamp, serverHighResTimestamp } = request;
    this.networkLatencyCounter.feed(clientHighResTimestamp);
    const response = { serverHighResTimestamp };
    return response;
  }
}

export function providePongCAHandler(resolver: ServiceResolver) {
  return new PongCAHandler(
    resolver.resolve(provideNetworkLatencyCounter),
  );
}
