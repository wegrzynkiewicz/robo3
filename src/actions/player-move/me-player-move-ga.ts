import { registerGADefinition } from "../../common/action/manager.ts";

export const enum MoveDirection {
  Q = 0b1010,
  W = 0b1000,
  E = 0b1001,
  A = 0b0010,
  S = 0b0000,
  D = 0b0001,
  Z = 0b0110,
  X = 0b0100,
  C = 0b0101,
}

export interface MePlayerMoveGA {
  direction: MoveDirection;
}

export const mePlayerMoveGADef = registerGADefinition<MePlayerMoveGA>({
  encoding: {
    type: "json",
  },
  kind: "me-player-move",
  key: 0x0020,
});
