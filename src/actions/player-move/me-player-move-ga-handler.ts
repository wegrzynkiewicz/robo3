import { GAHandler } from "../../common/action/processor.ts";
import { provideSpaceManager, SpaceManager } from "../../common/space/space-manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { MePlayerMoveGA } from "./me-player-move-ga.ts";

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

export function provideMePlayerMoveGAHandler(resolver: ServiceResolver) {
  return new MePlayerMoveGAHandler(
    resolver.resolve(provideSpaceManager),
  );
}
