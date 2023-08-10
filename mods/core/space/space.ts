import { Breaker } from "../../common/asserts.ts";
import { ChunkManager } from "../chunk/chunk.ts";
import { Cube, Dimension } from "../numbers.ts";

export interface SpaceBinding {
  chunkCount: number;
  chunkManager: ChunkManager;
  dimension: Dimension;
  space: Space;
}

export interface Space {
  coords: Cube;
  name: string;
  spaceId: number;
}

export function calcSpaceDimension(cube: Cube): Dimension {
  const { b, f, l, n, r, t } = cube;
  return {
    d: n - f + 1,
    h: b - t + 1,
    w: r - l + 1,
  };
}

export function calcSpaceChunks(dimension: Dimension) {
  const { d, h, w } = dimension;
  return d * h * w;
}

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
    const { coords, spaceId } = space;
    const chunkManager = new ChunkManager();
    const dimension = calcSpaceDimension(coords);
    const chunkCount = calcSpaceChunks(dimension);
    const spaceBinding: SpaceBinding = {
      chunkCount,
      chunkManager,
      dimension,
      space,
    };
    this.spaces.set(spaceId, spaceBinding);
  }
}
