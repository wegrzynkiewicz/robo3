export interface UAInput<TData> {
  name: string;
}

export interface UADefinition<TData> {
  name: string;
}

export type AnyUADefinition = UADefinition<any>;

export class UAManager {
  public readonly byName = new Map<string, AnyUADefinition>();

  public registerUADefinition<TData>(definition: UAInput<TData>): UADefinition<TData> {
    const { name } = definition;
    const action: UADefinition<TData> = {
      name,
    };
    this.byName.set(name, action);
    return action;
  }
}

const manager = new UAManager();
export function registerUADefinition<TData>(input: UAInput<TData>): UADefinition<TData> {
  return manager.registerUADefinition(input);
} 

export function provideUAManager() {
  return manager;
}
