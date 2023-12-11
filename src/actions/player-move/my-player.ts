import { Being } from "../../apps/game-server/being-manager.ts";
import { MoveDirection } from "./me-player-move-ga.ts";

const nullBeing = {
  direct: MoveDirection.S,
  id: 0,
  updated: false,
  x: 0,
  y: 0,
  z: 0,
};

export class MyPlayer {
  public being: Being = nullBeing;
}

export function provideMyPlayer() {
  return new MyPlayer();
}
