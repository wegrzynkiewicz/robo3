import { GAHandler } from "../../common/action/processor.ts";

import { PingGA } from "../../domain/stats/pingGA.ts";
import { PongGA } from "../../domain/stats/pongGA.ts";

export class PingGAHandler implements GAHandler<PingGA, PongGA> {
  async handle(request: PingGA): Promise<PongGA> {
    const { clientHighResTimestamp } = request;
    const serverHighResTimestamp = performance.now();
    const response = { clientHighResTimestamp, serverHighResTimestamp };
    return response;
  }
}

export function providePingGAHandler() {
  return new PingGAHandler();
}