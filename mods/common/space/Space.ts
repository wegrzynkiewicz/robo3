import { BeingManager } from "../../domain-server/BeingManager.ts";
import { Cube, Dimension } from "../../core/numbers.ts";

export class Space {
  public readonly beingManager = new BeingManager();
}

// export interface Space {
//   coords: Cube;
//   name: string;
//   spaceId: number;
// }

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