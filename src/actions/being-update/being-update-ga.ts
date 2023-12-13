import { GAHandler } from "../../common/action/define.ts";
import { registerGADefinition } from "../../common/action/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { SpaceManager, provideSpaceManager } from "../../common/space/space-manager.ts";
import { MePlayer, provideMePlayer } from "../me/me-player.ts";

export interface BeingUpdateGA {
  id: number;
  x: number;
  y: number;
}

export const beingUpdateGADef = registerGADefinition<BeingUpdateGA>({
  encoding: {
    type: "json",
  },
  kind: "being-update",
  key: 0x0021,
});

export class BeingUpdateGAHandler implements GAHandler<BeingUpdateGA, void> {
  public constructor(
    protected readonly spaceManager: SpaceManager,
    protected readonly mePlayer: MePlayer,
  ) { }

  public async handle(request: BeingUpdateGA): Promise<void> {
    const space = this.spaceManager.obtain(1);
    const being = space.beingManager.obtain(request.id);
    being.x = request.x;
    being.y = request.y;
    // TODO: search my player
    if (being.id === this.mePlayer.beingId) {
      this.mePlayer.absolutePos.x = request.x;
      this.mePlayer.absolutePos.y = request.y;
    }
  }
}

export function provideBeingUpdateGAHandler(resolver: ServiceResolver) {
  return new BeingUpdateGAHandler(
    resolver.resolve(provideSpaceManager),
    resolver.resolve(provideMePlayer),
  );
}
