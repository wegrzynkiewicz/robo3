import { Breaker } from "../../common/asserts.ts";
import { ChunkManager } from "../chunk/chunk.ts";
import { Dimension } from "../numbers.ts";

export class SpaceManager {
  protected readonly spaces = new Map<number, SpaceBinding>();
  public get(spaceId: number): SpaceBinding {
    const spaceBinding = this.spaces.get(spaceId);
    if (spaceBinding === undefined) {
      throw new Breaker("not-found-space-binding-by-space-id", { spaceId });
    }
    return spaceBinding;
  }
  public register(space: Space) {
    const { spaceId } = space;
    const chunkManager = new ChunkManager();
    const spaceBinding: SpaceBinding = {
      chunkManager,
      space,
    };
    this.spaces.set(spaceId, spaceBinding);
  }
}

export interface SpaceBinding {
  chunkManager: ChunkManager;
  space: Space;
}

export interface Space {
  chunks: Dimension;
  name: string;
  spaceId: number;
}
