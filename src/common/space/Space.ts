import { BeingManager } from "../../domain-server/BeingManager.ts";
import { Cube } from "../../core/numbers.ts";
import { Dim3D } from "../math/Dim3D.ts";

export class Space {
  public readonly beingManager = new BeingManager();
}

// export interface Space {
//   coords: Cube;
//   name: string;
//   spaceId: number;
// }

export function calcSpaceDimension(cube: Cube): Dim3D {
  const { b, f, l, n, r, t } = cube;
  return {
    d: n - f + 1,
    h: b - t + 1,
    w: r - l + 1,
  };
}

export function calcSpaceChunks(dimension: Dim3D) {
  const { d, h, w } = dimension;
  return d * h * w;
}
