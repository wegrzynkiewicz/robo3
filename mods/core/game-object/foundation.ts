import { assertRequiredString, throws } from "../../common/asserts.ts";
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

export type GameObjectCreator = new (...args: any[]) => GameObject<any, any>;

export interface ComplexGameObjectType extends GameObjectTypeCommon {
  goCreator: GameObjectCreator;
  goCreatorOptions: Record<string, unknown>;
  spriteIndexes: Record<string, number>;
  spriteKeys: Record<string, string>;
}

export type GameObjectType = SimpleGameObjectType | ComplexGameObjectType;

export class GameObjectTEncodingTable {
  protected nextIndex = 256;
  public readonly gotByKey = new Map<string, GameObjectType>();
  public readonly gotByIndex: GameObjectType[] = [];

  public set(index: number, got: GameObjectType): void {
    const { gotKey } = got;
    assertRequiredString(got.gotKey, "got-without-key", { got });
    const existingByKey = this.gotByKey.get(gotKey);
    if (existingByKey !== undefined) {
      throws("got-with-key-already-exists", {
        key: gotKey,
        got,
        existingByKey,
      });
    }
    const existingByIndex = this.gotByIndex[index];
    if (existingByIndex !== undefined) {
      throws("got-with-index-already-exists", { index, got, existingByIndex });
    }
    this.gotByIndex[index] = got;
    this.gotByKey.set(gotKey, got);
  }

  public push(got: GameObjectType): number {
    const index = this.nextIndex++;
    this.set(index, got);
    return index;
  }
}

export abstract class GameObject<TState = undefined, TOptions = undefined> {
  public readonly state: TState;
  public readonly properties: GameObjectProperties;
  public readonly options: TOptions;
  public readonly type: ComplexGameObjectType;
  public constructor(
    { options, properties, state, type }: {
      options: TOptions;
      properties: GameObjectProperties;
      state: TState;
      type: ComplexGameObjectType;
    },
  ) {
    this.options = options;
    this.properties = properties;
    this.state = state;
    this.type = type;
  }
}
