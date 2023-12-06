import { DEFAULT_GAME_OBJECT_SPRITE_INDEX } from "../../core/vars.ts";

export interface GameObjectProperties {
  walkable: boolean;
  walkSpeed: number;
  spriteIndex: number;
}

export function createDefaultGameObjectProperties(): GameObjectProperties {
  return {
    walkable: false,
    walkSpeed: 0.0,
    spriteIndex: DEFAULT_GAME_OBJECT_SPRITE_INDEX,
  };
}

export const defaultGameObjectProperties = createDefaultGameObjectProperties();
