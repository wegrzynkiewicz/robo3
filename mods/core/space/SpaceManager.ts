import { registerService } from "../../dependency/service.ts";
import { Space } from "./Space.ts";

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

export const spaceManagerService = registerService({
  async provider(): Promise<SpaceManager> {
    return new SpaceManager();
  },
});
