import { ComplexGameObjectType } from "./foundation.ts";
import { GameObjectProperties } from "./properties.ts";

export type GameObjectProcessorConstructor = new (...args: any[]) => GameObjectProcessor<any, any>;

export abstract class GameObjectProcessor<TState = undefined, TOptions = undefined> {
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
