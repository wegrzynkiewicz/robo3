import { registerService } from "../../dependency/service.ts";

export class NetworkLatencyCounter {
  public ping = 0;

  public feed(clientHighResTimestamp: number) {
    const now = performance.now();
    const delta = now - clientHighResTimestamp;
    this.ping = delta;
  }
}

export function provideNetworkLatencyCounter() {
  return new NetworkLatencyCounter();
}
