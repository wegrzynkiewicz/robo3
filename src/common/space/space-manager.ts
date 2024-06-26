import { Space } from "./space.ts";

export class SpaceManager {
  public readonly byId = new Map<number, Space>();

  public obtain(spaceId: number): Space {
    const probablySpace = this.byId.get(spaceId);
    if (probablySpace === undefined) {
      const space = new Space();
      this.byId.set(spaceId, space);
      return space;
    }
    return probablySpace;
  }
}

export function provideSpaceManager() {
  return new SpaceManager();
}
