import { AnySADefinition, SADefinition } from "./define.ts";

export class SAManager {
  public readonly byKind = new Map<string, AnySADefinition>();

  public registerSADefinition<TInstance>(definition: SADefinition<TInstance>): SADefinition<TInstance> {
    const { kind } = definition;
    this.byKind.set(kind, definition);
    return definition;
  }
}

const saManager = new SAManager();
export const registerSADefinition = saManager.registerSADefinition.bind(saManager);

export function provideSAManager() {
  return saManager;
}
