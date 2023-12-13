import { registerGADefinition } from "../../common/action/manager.ts";
import { provideSpaceManager, SpaceManager } from "../../common/space/space-manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { GAHandler } from "../../common/action/define.ts";
import { PlayerContext, provideScopedPlayerContext } from "../../apps/game-server/player-context/player-context.ts";

export const enum MoveDirection {
  Q = 0b1010,
  W = 0b1000,
  E = 0b1001,
  A = 0b0010,
  S = 0b0000,
  D = 0b0001,
  Z = 0b0110,
  X = 0b0100,
  C = 0b0101,
}

export interface MePlayerMoveGA {
  direction: MoveDirection;
}

export const mePlayerMoveGADef = registerGADefinition<MePlayerMoveGA>({
  encoding: {
    type: "json",
  },
  kind: "me-player-move",
  key: 0x0020,
});

export class MePlayerMoveGAHandler implements GAHandler<MePlayerMoveGA, void> {
  public constructor(
    protected readonly playerContext: PlayerContext,
    protected readonly spaceManager: SpaceManager,
  ) { }

  public async handle(request: MePlayerMoveGA): Promise<void> {
    const space = this.spaceManager.obtain(1);
    const being = space.beingManager.obtain(this.playerContext.playerContextId);
    being.direct = request.direction;
  }
}

export function provideMePlayerMoveGAHandler(resolver: ServiceResolver) {
  return new MePlayerMoveGAHandler(
    resolver.resolve(provideScopedPlayerContext),
    resolver.resolve(provideSpaceManager),
  );
}
