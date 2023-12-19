import { Being, BeingManager, provideScopedBeingManager } from "./manager.ts";
import { Looper } from "../simulator/looper.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { ServerPlayerContextManager, provideScopedServerPlayerContextManager } from "../../apps/game-server/server-player-context/manager.ts";
import { provideScopedGADispatcher } from "../action/dispatcher.ts";
import { beingUpdateGADef } from "../../actions/being-update/being-update-ga.ts";

export class BeingSimulator implements Looper {
  public constructor(
    protected readonly beingManager: BeingManager,
    protected readonly serverPlayerContextManager: ServerPlayerContextManager,
  ) { }

  public loop(deltaTime: number): void {
    for (const being of this.beingManager.byId.values()) {
      this.updateBeing(being, deltaTime);
    }
  }

  public updateBeing(being: Being, deltaTime: number) {
    let x = 0;
    let y = 0;
    if (being.direct & 0b1000) {
      y = -1;
    }
    if (being.direct & 0b0100) {
      y = 1;
    }
    if (being.direct & 0b0010) {
      x = -1;
    }
    if (being.direct & 0b0001) {
      x = 1;
    }
    being.rx += x * (64 * deltaTime);
    being.ry += y * (64 * deltaTime);
    being.x = Math.floor(being.rx);
    being.y = Math.floor(being.ry);
    being.wasUpdated = !(x === 0 && y === 0);
    for (const playerContext of this.serverPlayerContextManager.byPlayerContextId.values()) {
      const dispatcher = playerContext.resolver.resolve(provideScopedGADispatcher);
      dispatcher.send(beingUpdateGADef, being)
    }
  }
}

export function provideScopedBeingSimulator(resolver: ServiceResolver) {
  return new BeingSimulator(
    resolver.resolve(provideScopedBeingManager),
    resolver.resolve(provideScopedServerPlayerContextManager),
  );
}
