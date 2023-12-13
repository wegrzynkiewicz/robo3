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
    const being: Being = {
      direct: MoveDirection.S,
      id: beingIdCounter++,
      x: 0,
      y: 0,
      z: 0,
    };
    this.byId.set(being.id, being);
    return being;
  }

  public obtain(beingId: number): Being {
    const probablyBeing = this.byId.get(beingId);
    if (probablyBeing === undefined) {
      return this.create();
    }
    return probablyBeing;
  }
}
