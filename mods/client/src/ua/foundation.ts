import { registerService } from "../../../core/dependency/service.ts";

export interface UAInput {
  name: string;
}

export interface UADefinition<TData> {
  name: string;
}

export type AnyUADefinition = UADefinition<any>;

export class UAManager {
  public readonly byName = new Map<string, AnyUADefinition>();

  public registerUADefinition<TData>(definition: UAInput): UADefinition<TData> {
    const { name } = definition;
    const action: UADefinition<TData> = {
      name,
    };
    this.byName.set(name, action);
    return action;
  }
}

const manager = new UAManager();
export const registerUADefinition = manager.registerUADefinition.bind(manager);

export const uaManagerService = registerService({
  async provider(): Promise<UAManager> {
    return manager;
  },
  singleton: true,
});
