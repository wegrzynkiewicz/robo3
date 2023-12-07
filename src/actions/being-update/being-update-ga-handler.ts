import { GAHandler } from "../../common/action/processor.ts";
import { SpaceManager, provideSpaceManager } from "../../common/space/space-manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { MyPlayer, provideMyPlayer } from "../player-move/my-player.ts";
import { BeingUpdateGA } from "./being-update-ga.ts";

export class BeingUpdateGAHandler implements GAHandler<BeingUpdateGA, void> {
  public constructor(
    protected readonly spaceManager: SpaceManager,
    protected readonly myPlayer: MyPlayer,
  ) { }

  public async handle(request: BeingUpdateGA): Promise<void> {
    const space = this.spaceManager.obtain(1);
    const being = space.beingManager.obtain(request.id);
    being.x = request.x;
    being.y = request.y;
    // TODO: search my player
    this.myPlayer.being = being;
  }
}

export function provideBeingUpdateGAHandler(resolver: ServiceResolver) {
  return new BeingUpdateGAHandler(
    resolver.resolve(provideSpaceManager),
    resolver.resolve(provideMyPlayer),
  );
}
