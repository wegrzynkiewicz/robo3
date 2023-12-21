import { CAHandler } from "../../common/action/define.ts";
import { registerCADefinition } from "../../common/action/manager.ts";
import { BeingManager, provideScopedBeingManager } from "../../common/being/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { MePlayer, provideMePlayer } from "../me/me-player.ts";

export interface BeingUpdateCA {
  id: number;
  x: number;
  y: number;
}

export const beingUpdateCADef = registerCADefinition<BeingUpdateCA>({
  encoding: {
    type: "json",
  },
  kind: "being-update",
});

export class BeingUpdateCAHandler implements CAHandler<BeingUpdateCA, void> {
  public constructor(
    protected readonly beingManager: BeingManager,
    protected readonly mePlayer: MePlayer,
  ) { }

  public async handle(request: BeingUpdateCA): Promise<void> {
    const being = this.beingManager.obtain(request.id);
    being.x = request.x;
    being.y = request.y;
    // TODO: search my player
    if (being.id === this.mePlayer.beingId) {
      this.mePlayer.absolutePos.x = request.x;
      this.mePlayer.absolutePos.y = request.y;
    }
  }
}

export function provideBeingUpdateCAHandler(resolver: ServiceResolver) {
  return new BeingUpdateCAHandler(
    resolver.resolve(provideScopedBeingManager),
    resolver.resolve(provideMePlayer),
  );
}
