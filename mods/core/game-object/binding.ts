import { ComplexGameObjectType, GameObjectType, SimpleGameObjectType } from "./foundation.ts";

export interface ComplexGameObjectBinding {
  gotIndex: number;
  spriteIndexes: Record<string, number>;
}

export interface ComplexGameObjectEntry<TOptions = Record<string, unknown>> {
  got: ComplexGameObjectType<TOptions>;
  binding: ComplexGameObjectBinding;
}

export interface SimpleGameObjectBinding {
  gotIndex: number;
  spriteIndex: number;
}

export interface SimpleGameObjectEntry {
  got: SimpleGameObjectType;
  binding: SimpleGameObjectBinding;
}

export type GameObjectEntry = ComplexGameObjectEntry | SimpleGameObjectEntry;

export function createGOTIndexTable(
  { gotMap }: {
    gotMap: Map<string, GameObjectType>,
  },
): GameObjectType[] {
  const gotByIndex: GameObjectType[] = [];
  for (const got of gotMap.values()) {
    const { predefinedGOTIndex } = got.definition;
    if (predefinedGOTIndex !== undefined) {
      gotByIndex[predefinedGOTIndex] = got;
    }
  }
  let gotIndex = 0;
  for (const got of gotMap.values()) {
    const { predefinedGOTIndex } = got.definition;
    if (predefinedGOTIndex === undefined) {
      while (gotByIndex[gotIndex] !== undefined) {
        gotIndex++;
      }
      gotByIndex[gotIndex] = got;
    }
  }
  return gotByIndex;
}
