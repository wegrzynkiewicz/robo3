import { MoveDirection } from "../../actions/player-move/me-player-move-ga.ts";

export interface Being {
  direct: MoveDirection;
  id: number;
  x: number;
  y: number;
  z: number;
}

let beingIdCounter = 1;

export class BeingManager {
  public byId = new Map<number, Being>();

  public create(): Being {
    const beingId = beingIdCounter++;
    const being = this.store(beingId);
    return being;
  }

  public obtain(beingId: number): Being {
    const probablyBeing = this.byId.get(beingId);
    if (probablyBeing === undefined) {
      return this.store(beingId);
    }
    return probablyBeing;
  }

  protected store(beingId: number) {
    const being: Being = {
      direct: MoveDirection.S,
      id: beingId,
      x: 0,
      y: 0,
      z: 0,
    };
    beingIdCounter = Math.max(beingIdCounter, beingId + 1);
    this.byId.set(beingId, being);
    return being;
  }

  public destroyBeing(beingId: number): void {
    this.byId.delete(beingId);
  }
}
