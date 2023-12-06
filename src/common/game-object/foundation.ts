import { ComplexGameObjectTypeDefinition, SimpleGameObjectTypeDefinition } from "./defining.ts";
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
  definition: SimpleGameObjectTypeDefinition;
  spriteKey: string;
}

export interface ComplexGameObjectType<TOptions = Record<string, unknown>> extends GameObjectTypeCommon {
  definition: ComplexGameObjectTypeDefinition;
  goProcessor: GameObjectProcessorConstructor;
  goProcessorOptions: TOptions;
  spriteKeys: Record<string, string>;
}

export type GameObjectType = SimpleGameObjectType | ComplexGameObjectType;
