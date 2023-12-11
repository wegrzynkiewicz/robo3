import { GAHandler } from "../../common/action/define.ts";
import { registerGADefinition } from "../../common/action/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";
import { NetworkLatencyCounter, provideNetworkLatencyCounter } from "./network-latency-counter.ts";
import { PangGA } from "./pang-ga.ts";

export interface PongGA {
  clientHighResTimestamp: number;
  serverHighResTimestamp: number;
}

const codec: BinaryBYOBCodec<PongGA> = {
  calcByteLength(): number {
    return 16;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): PongGA {
    const dv = new DataView(buffer, byteOffset);
    const clientHighResTimestamp = dv.getFloat64(0, true);
    const serverHighResTimestamp = dv.getFloat64(8, true);
    return { clientHighResTimestamp, serverHighResTimestamp };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: PongGA): void {
    const { clientHighResTimestamp, serverHighResTimestamp } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setFloat64(0, clientHighResTimestamp, true);
    dv.setFloat64(8, serverHighResTimestamp, true);
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

export class PongGAHandler implements GAHandler<PongGA, PangGA> {
  public constructor(
    protected networkLatencyCounter: NetworkLatencyCounter,
  ) {}

  async handle(request: PongGA): Promise<PangGA> {
    const { clientHighResTimestamp, serverHighResTimestamp } = request;
    this.networkLatencyCounter.feed(clientHighResTimestamp);
    const response = { serverHighResTimestamp };
    return response;
  }
}

export function providePongGAHandler(resolver: ServiceResolver) {
  return new PongGAHandler(
    resolver.resolve(provideNetworkLatencyCounter),
  );
}
