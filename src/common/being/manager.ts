import { MoveDirection } from "../../actions/player-move/me-player-move-ca.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { provideUpdatedBeingList } from "./update-list.ts";

export interface Being {
  direct: MoveDirection;
  id: number;
  x: number;
  rx: number;
  y: number;
  ry: number;
  z: number;
}

let beingIdCounter = 1;

export class BeingManager {
  public byId = new Map<number, Being>();

  public constructor(
    protected readonly updatedBeingList: Set<Being>,
  ) { }

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
      rx: 0,
      x: 0,
      ry: 0,
      y: 0,
      z: 0,
    };
    beingIdCounter = Math.max(beingIdCounter, beingId + 1);
    this.byId.set(beingId, being);
    this.updatedBeingList.add(being);
    return being;
  }

  public destroyBeing(beingId: number): void {
    this.byId.delete(beingId);
  }
}

export function provideBeingManager(resolver: ServiceResolver) {
  return new BeingManager(
    resolver.resolve(provideUpdatedBeingList),
  );
}
