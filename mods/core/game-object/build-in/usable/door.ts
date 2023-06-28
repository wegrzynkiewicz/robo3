import { UNDEFINED_GAME_OBJECT_SPRITE_INDEX } from "../../../vars.ts";
import { defineComplexGameObjectType, defineGameObjectProcessor } from "../../defining.ts";
import { GameObjectProcessor } from "../../processor.ts";

export interface DoorState {
  open: boolean;
}

export class Door extends GameObjectProcessor<DoorState> {
  public updateProperties(): void {
    const { entry, properties, state } = this;
    if (state.open) {
      properties.spriteIndex = entry.binding.spriteIndexes["open"] ?? UNDEFINED_GAME_OBJECT_SPRITE_INDEX;
      properties.walkable = true;
    } else {
      properties.spriteIndex = entry.binding.spriteIndexes["close"] ?? UNDEFINED_GAME_OBJECT_SPRITE_INDEX;
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
