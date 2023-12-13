import { pos3D } from "../../common/math/pos3d.ts";

export class MePlayer {
  public absolutePos = pos3D(0, 0, 0);
  public beingId = 0;
  public spaceId = 0;
}

export function provideMePlayer() {
  return new MePlayer();
}
