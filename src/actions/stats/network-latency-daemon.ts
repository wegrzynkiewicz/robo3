import { createPerformanceCounter } from "../../common/utils/performance-counter.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { pingGADef } from "./ping-ga.ts";
import { pongGADef } from "./pong-ga.ts";
import { Breaker } from "../../common/utils/breaker.ts";
import { GARequestor } from "../../common/action/define.ts";
import { provideScopedGARequestor } from "../../common/action/requestor.ts";

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
      throw new Breaker("error-in-network-latency-daemon", { error });
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
    resolver.resolve(provideScopedGARequestor),
  );
}
