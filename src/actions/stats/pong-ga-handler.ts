import { ServiceResolver } from "../../common/dependency/service.ts";
import { PangGA } from "./pang-ga.ts";
import { PongGA } from "./pong-ga.ts";
import { NetworkLatencyCounter, provideNetworkLatencyCounter } from "./network-latency-counter.ts";
import { GAHandler } from "../../common/action/define.ts";

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
