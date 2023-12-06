import { GAHandler } from "../../core/action/processor.ts";

import { PangGA } from "../../domain/stats/pangGA.ts";

export class PangGAHandler implements GAHandler<PangGA, void> {
  async handle(request: PangGA): Promise<void> {
    // TODO: implement
  }
}

export function providePangGAHandler() {
  return new PangGAHandler();
}
