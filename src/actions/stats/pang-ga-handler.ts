import { GAHandler } from "../../common/action/processor.ts";

import { PangGA } from "./pang-ga.ts";

export class PangGAHandler implements GAHandler<PangGA, void> {
  async handle(request: PangGA): Promise<void> {
    // TODO: implement
  }
}

export function providePangGAHandler() {
  return new PangGAHandler();
}