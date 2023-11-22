import { GAHandler } from "../../core/action/processor.ts";
import { ServiceResolver, registerService } from "../../dependency/service.ts";
import { PangGA } from "../../domain/stats/pangGA.ts";
import { PongGA } from "../../domain/stats/pongGA.ts";
import { NetworkLatencyCounter } from "./NetworkLatencyCounter.ts";
import { networkLatencyCounterService } from "./NetworkLatencyCounter.ts";

export class PongGAHandler implements GAHandler<PongGA, PangGA> {
  public constructor(
    protected networkLatencyCounter: NetworkLatencyCounter,
  ) { }

  async handle(request: PongGA): Promise<PangGA> {
    const { clientHighResTimestamp, serverHighResTimestamp } = request;
    this.networkLatencyCounter.feed(clientHighResTimestamp);
    const response = { serverHighResTimestamp };
    return response;
  }
}

export const pongGAHandlerService = registerService({
  async provider(resolver: ServiceResolver): Promise<PongGAHandler> {
    return new PongGAHandler(
      await resolver.resolve(networkLatencyCounterService)
    );
  },
});
