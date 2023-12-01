import { GAHandler } from "../../core/action/processor.ts";
import { registerService } from "../../dependency/service.ts";
import { MePlayerMoveGA } from "../../domain-client/player-move/move.ts";

export class MePlayerMoveGAHandler implements GAHandler<MePlayerMoveGA, void> {
  async handle(request: MePlayerMoveGA): Promise<void> {
    // nothing;
  }
}

export const mePlayerMoveGAHandlerService = registerService({
  name: "mePlayerMoveGAHandler",
  async provider() {
    return new MePlayerMoveGAHandler();
  },
});
