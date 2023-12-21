import { createPerformanceCounter } from "../../common/utils/performance-counter.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { pingCADef } from "./ping-ca.ts";
import { pongCADef } from "./pong-ca.ts";
import { Breaker } from "../../common/utils/breaker.ts";
import { CARequestor } from "../../common/communication/action/define.ts";
import { provideScopedCARequestor } from "../../common/communication/action/requestor.ts";

export class NetworkLatencyDaemon {
  protected timer = 0;
  protected counter = createPerformanceCounter("latency", 1);

  public constructor(
    protected gaRequestorService: CARequestor,
  ) {}

  public async action() {
    try {
      const payload = { clientHighResTimestamp: performance.now() };
      this.counter.start();
      await this.gaRequestorService.request(pingCADef, pongCADef, payload);
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
    resolver.resolve(provideScopedCARequestor),
  );
}
