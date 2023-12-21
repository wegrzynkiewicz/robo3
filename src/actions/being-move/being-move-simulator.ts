import { Being, BeingManager, provideScopedBeingManager } from "../../common/being/manager.ts";
import { Looper } from "../../common/game/looper.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";

export class BeingSimulator implements Looper {
  public constructor(
    protected readonly beingManager: BeingManager,
  ) { }

  public loop(deltaTime: number): void {
    for (const being of this.beingManager.byId.values()) {
      this.updateBeing(being, deltaTime);
    }
  }

  public updateBeing(being: Being, deltaTime: number) {
    if (being.direct === 0) {
      return;
    }
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
  }
}

export function provideScopedBeingSimulator(resolver: ServiceResolver) {
  return new BeingSimulator(
    resolver.resolve(provideScopedBeingManager),
  );
}
