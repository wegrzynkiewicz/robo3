import { registerService } from "../../dependency/service.ts";
import { Being } from "../../domain-server/BeingManager.ts";
import { MoveDirection } from "./move.ts";

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

export const myPlayerService = registerService({
  name: "myPlayer",
  async provider() {
    return new MyPlayer();
  },
});
