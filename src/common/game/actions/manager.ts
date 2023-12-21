import { AnyGADefinition, GADefinition } from "./define.ts";

export class GAManager {
  public readonly byKind = new Map<string, AnyGADefinition>();

  public registerGADefinition<TInstance>(definition: GADefinition<TInstance>): GADefinition<TInstance> {
    const { kind } = definition;
    this.byKind.set(kind, definition);
    return definition;
  }
}

const GAManager = new GAManager();
export const registerGADefinition = GAManager.registerGADefinition.bind(GAManager);

export function provideGAManager() {
  return GAManager;
}
