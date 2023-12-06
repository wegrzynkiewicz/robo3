import { GAHandler } from "../../core/action/processor.ts";
import { SpaceManager, spaceManagerService } from "../../core/space/SpaceManager.ts";
import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { MePlayerMoveGA } from "../../domain-client/player-move/move.ts";

export class MePlayerMoveGAHandler implements GAHandler<MePlayerMoveGA, void> {
  public constructor(
    protected readonly spaceManager: SpaceManager,
  ) {}

  public async handle(request: MePlayerMoveGA): Promise<void> {
    const space = this.spaceManager.obtain(1);
    const being = space.beingManager.obtain(1);
    being.direct = request.direction;
  }
}

export const mePlayerMoveGAHandlerService = registerService({
  name: "mePlayerMoveGAHandler",
  async provider(resolver: ServiceResolver) {
    return new MePlayerMoveGAHandler(
      resolver.resolve(provideSpaceManager),
    );
  },
});
