import { createPerformanceCounter } from "../../common/utils/performance-counter.ts";
import { logger } from "../../common/utils/logger.ts";
import { GARequestor, provideGARequestor } from "../../common/action/requestor.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { pingGADef } from "./ping-ga.ts";
import { pongGADef } from "./pong-ga.ts";

export class NetworkLatencyDaemon {
  protected timer = 0;
  protected counter = createPerformanceCounter("latency", 1);

  public constructor(
    protected gaRequestorService: GARequestor,
  ) {}

  public async action() {
    try {
      const payload = { clientHighResTimestamp: performance.now() };
      this.counter.start();
      await this.gaRequestorService.request(pingGADef, pongGADef, payload);
      this.counter.end();
    } catch (error) {
      logger.error("error-in-network-latency-daemon", { error });
    }
  }

  public start() {
    this.timer = setInterval(() => this.action(), 1000);
  }

  public stop() {
    clearInterval(this.timer);
  }
}

export function provideNetworkLatencyDaemon(resolver: ServiceResolver) {
  return new NetworkLatencyDaemon(
    resolver.resolve(provideGARequestor),
  );
}
