import { UNDEFINED_GAME_OBJECT_SPRITE_INDEX } from "../../../vars.ts";
import { defineComplexGameObjectType, defineGameObjectProcessor } from "../../defining.ts";
import { GameObjectProcessor } from "../../processor.ts";

export interface DoorState {
  open: boolean;
}

export class Door extends GameObjectProcessor<DoorState> {
  public updateProperties(): void {
    const { properties, state, type } = this;
    if (state.open) {
      properties.spriteIndex = type.spriteIndexes["open"] ?? UNDEFINED_GAME_OBJECT_SPRITE_INDEX;
      properties.walkable = true;
    } else {
      properties.spriteIndex = type.spriteIndexes["close"] ?? UNDEFINED_GAME_OBJECT_SPRITE_INDEX;
      properties.walkable = false;
    }
  }
}

defineGameObjectProcessor({
  gocKey: "core/usable/door.prc",
  processor: Door,
});

defineComplexGameObjectType({
  gotKey: "core/usable/door.cgo",
  goProcessor: "core/usable/door.prc",
  spriteKey: "core/usable/door.spr",
});
