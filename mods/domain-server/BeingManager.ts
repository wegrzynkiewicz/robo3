import { MoveDirection } from "../domain-client/player-move/move.ts";

export interface Being {
  x: number,
  y: number,
  z: number,
  direct: MoveDirection,
  id: number,
}

export class BeingManager {
  public byId = new Map<number, Being>();

  public obtain(beingId: number): Being {
    const probablyBeing = this.byId.get(beingId);
    if (probablyBeing === undefined) {
      const being: Being = {
        direct: MoveDirection.S,
        id: beingId,
        x: 0,
        y: 0,
        z: 0,
      };
      this.byId.set(beingId, being);
      return being;
    }
    return probablyBeing;
  }
}
