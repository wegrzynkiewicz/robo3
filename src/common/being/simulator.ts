import { Being, BeingManager, provideScopedBeingManager } from "./manager.ts";
import { Looper } from "../simulator/looper.ts";
import { ServiceResolver } from "../dependency/service.ts";

export class BeingSimulator implements Looper {
  public constructor(
    protected readonly beingManager: BeingManager,
  ) {}
  
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
    being.x += x * (16 * deltaTime);
    being.y += y * (16 * deltaTime);
    being.wasUpdated = !(x === 0 && y === 0);
  }
}

export function provideScopedBeingSimulator(resolver: ServiceResolver) {
  return new BeingSimulator(
    resolver.resolve(provideScopedBeingManager),
  );
}
