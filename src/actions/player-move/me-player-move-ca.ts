import { registerCADefinition } from "../../common/communication/action/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { CAHandler } from "../../common/communication/action/define.ts";
import { provideScopedServerPlayerContext, ServerPlayerContext } from "../../apps/game-server/server-player-context/define.ts";
import { BeingManager, provideScopedBeingManager } from "../../common/being/manager.ts";

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

export interface MePlayerMoveCA {
  direction: MoveDirection;
}

export const mePlayerMoveCADef = registerCADefinition<MePlayerMoveCA>({
  encoding: {
    type: "json",
  },
  kind: "me-player-move",
});

export class MePlayerMoveCAHandler implements CAHandler<MePlayerMoveCA, void> {
  public constructor(
    protected readonly beingManager: BeingManager,
    protected readonly playerContext: ServerPlayerContext,
  ) { }

  public async handle(request: MePlayerMoveCA): Promise<void> {
    const being = this.beingManager.obtain(this.playerContext.playerContextId);
    being.direct = request.direction;
  }
}

export function provideMePlayerMoveCAHandler(resolver: ServiceResolver) {
  return new MePlayerMoveCAHandler(
    resolver.resolve(provideScopedBeingManager),
    resolver.resolve(provideScopedServerPlayerContext),
  );
}
