import { GAHandler } from "../../core/action/processor.ts";
import { ServiceResolver } from "../../dependency/service.ts";
import { PangGA } from "../../domain/stats/pangGA.ts";
import { PongGA } from "../../domain/stats/pongGA.ts";
import { NetworkLatencyCounter, provideNetworkLatencyCounter } from "./NetworkLatencyCounter.ts";

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
