import { GameObjectProcessorConstructor } from "./processor.ts";
import { GameObjectProperties } from "./properties.ts";

export interface GameObjectState {
  stateId: string;
  typeId: string;
}

export interface GameObjectTypeCommon {
  gotKey: string;
  properties: GameObjectProperties;
}

export interface SimpleGameObjectType extends GameObjectTypeCommon {
  spriteKey: string;
  spriteIndex: number;
}

export interface ComplexGameObjectType extends GameObjectTypeCommon {
  goProcessor: GameObjectProcessorConstructor;
  goProcessorOptions: Record<string, unknown>;
  spriteIndexes: Record<string, number>;
  spriteKeys: Record<string, string>;
}

export type GameObjectType = SimpleGameObjectType | ComplexGameObjectType;
