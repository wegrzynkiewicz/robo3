import { GAHandler } from "../../core/action/processor.ts";
import { registerService } from "../../dependency/service.ts";
import { PangGA } from "../../domain/stats/pangGA.ts";

export class PangGAHandler implements GAHandler<PangGA, void> {
  async handle(request: PangGA): Promise<void> {
    // TODO: implement
  }
}

export const pangGAHandlerService = registerService({
  name: "pangGAHandler",
  async provider(): Promise<PangGAHandler> {
    return new PangGAHandler();
  },
});
