import { UNDEFINED_GAME_OBJECT_SPRITE_INDEX } from "../../../vars.ts";
import { defineComplexGameObjectType, defineGameObjectCreator } from "../../defining.ts";
import { GameObject } from "../../foundation.ts";

export interface DoorState {
  open: boolean;
}

export class Door extends GameObject<DoorState> {
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

defineGameObjectCreator({
  gocKey: "core/usable/door.crt",
  creator: Door,
});

defineComplexGameObjectType({
  gotKey: "core/usable/door.cgo",
  goCreator: "core/usable/door.crt",
  spriteKey: "core/usable/door.spr",
});
