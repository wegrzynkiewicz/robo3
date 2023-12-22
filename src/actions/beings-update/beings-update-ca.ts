import { CAHandler } from "../../common/communication/action/define.ts";
import { registerCADefinition } from "../../common/communication/action/manager.ts";
import { BeingManager, provideBeingManager } from "../../common/being/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { MePlayer, provideMePlayer } from "../me/me-player.ts";
import { MoveDirection } from "../player-move/me-player-move-ca.ts";

export interface BeingUpdate {
  beingId: number;
  direct: MoveDirection;
  x: number;
  y: number;
  z: number;
}

export interface BeingsUpdateCA {
  beings: BeingUpdate[];
}

export const beingsUpdateCADef = registerCADefinition<BeingsUpdateCA>({
  encoding: {
    type: "json",
  },
  kind: "beings-update-ca",
});

export class BeingsUpdateCAHandler implements CAHandler<BeingsUpdateCA, void> {
  public constructor(
    protected readonly beingManager: BeingManager,
    protected readonly mePlayer: MePlayer,
  ) { }

  public async handle(request: BeingsUpdateCA): Promise<void> {
    const { beings } = request;
    for (const update of beings) {
      const { beingId, direct, x, y, z } = update;
      const being = this.beingManager.obtain(beingId);
      being.direct = direct;
      being.x = x;
      being.y = y;
      being.z = z;
      if (being.id === this.mePlayer.beingId) {
        this.mePlayer.absolutePos.x = x;
        this.mePlayer.absolutePos.y = y;
      }
    }
  }
}

export function provideBeingsUpdateCAHandler(resolver: ServiceResolver) {
  return new BeingsUpdateCAHandler(
    resolver.resolve(provideBeingManager),
    resolver.resolve(provideMePlayer),
  );
}
