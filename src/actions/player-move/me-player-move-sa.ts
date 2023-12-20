import { MoveDirection } from "./me-player-move-ga.ts";

export interface MePlayerMoveSA {
  beingId: number;
  direction: MoveDirection;
}

export const mePlayerMoveGADef = registerSADefinition<MePlayerMoveGA>({
  key: 0x0020,
});
