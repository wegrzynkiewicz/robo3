import { GAHandler } from "../../common/action/define.ts";
import { registerGADefinition } from "../../common/action/manager.ts";
import { BeingManager, provideScopedBeingManager } from "../../common/being/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
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
});

export class BeingUpdateGAHandler implements GAHandler<BeingUpdateGA, void> {
  public constructor(
    protected readonly beingManager: BeingManager,
    protected readonly mePlayer: MePlayer,
  ) { }

  public async handle(request: BeingUpdateGA): Promise<void> {
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

export function provideBeingUpdateGAHandler(resolver: ServiceResolver) {
  return new BeingUpdateGAHandler(
    resolver.resolve(provideScopedBeingManager),
    resolver.resolve(provideMePlayer),
  );
}
