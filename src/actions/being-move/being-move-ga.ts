import { Being, BeingManager, provideScopedBeingManager } from "../../common/being/manager.ts";
import { provideScopedUpdatedBeingList } from "../../common/being/update-list.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { GAHandler } from "../../common/game/action/define.ts";
import { registerGADefinition } from "../../common/game/action/manager.ts";
import { MoveDirection } from "../player-move/me-player-move-ca.ts";

export interface BeingMoveGA {
  beingId: number;
  direction: MoveDirection;
}

export const beingMoveGADef = registerGADefinition<BeingMoveGA>({
  kind: "being-move-ga",
});

export class BeingMoveGAHandler implements GAHandler<BeingMoveGA>{
  public constructor(
    protected readonly beingManager: BeingManager,
    protected readonly updatedBeingList: Set<Being>,
  ) { }
  
  public async handle(action: BeingMoveGA): Promise<void> {
    const { beingId, direction } = action;
    const being = this.beingManager.byId.get(beingId);
    if (being === undefined) {
      return;
    }
    being.direct = direction;
    this.updatedBeingList.add(being);
  }
}

export function provideBeingMoveGAHandler(resolver: ServiceResolver) {
  return new BeingMoveGAHandler(
    resolver.resolve(provideScopedBeingManager),
    resolver.resolve(provideScopedUpdatedBeingList),
  );
}
