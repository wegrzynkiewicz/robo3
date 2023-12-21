import { BeingManager, provideScopedBeingManager } from "../../common/being/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { GAHandler } from "../../common/game/action/define.ts";
import { registerGADefinition } from "../../common/game/action/manager.ts";
import { MoveDirection } from "../player-move/me-player-move-ca.ts";

export interface BeingMoveGA {
  beingId: number;
  direction: MoveDirection;
}

export const beingMoveGA = registerGADefinition<BeingMoveGA>({
  kind: "being-move",
});

export class BeingMoveGAHandler implements GAHandler<BeingMoveGA>{
  public constructor(
    protected readonly beingManager: BeingManager,
  ) { }
  
  public async handle(action: BeingMoveGA): Promise<void> {
    const { beingId, direction } = action;
    const being = this.beingManager.byId.get(beingId);
    if (being === undefined) {
      return;
    }
    being.direct = direction;
  }
}

export function provideBeingMoveGAHandler(resolver: ServiceResolver) {
  return new BeingMoveGAHandler(
    resolver.resolve(provideScopedBeingManager),
  );
}
