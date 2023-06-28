import { ComplexGameObjectEntry } from "./binding.ts";
import { GameObjectProperties } from "./properties.ts";

export type GameObjectProcessorConstructor = new (...args: any[]) => GameObjectProcessor<any, any>;

export abstract class GameObjectProcessor<TState = undefined, TOptions = Record<string, unknown>> {
  public readonly entry: ComplexGameObjectEntry<TOptions>;
  public readonly state: TState;
  public readonly properties: GameObjectProperties;
  public constructor(
    { entry, properties, state }: {
      entry: ComplexGameObjectEntry<TOptions>;
      properties: GameObjectProperties;
      state: TState;
    },
  ) {
    this.entry = entry;
    this.properties = properties;
    this.state = state;
  }
}
