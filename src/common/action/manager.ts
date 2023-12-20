import { AnyGADefinition, GADefinition } from "./define.ts";

export class GAManager {
  public readonly byKey = new Map<number, AnyGADefinition>();
  public readonly byKind = new Map<string, AnyGADefinition>();

  public registerGADefinition<TInstance>(definition: GADefinition<TInstance>): GADefinition<TInstance> {
    const { encoding, kind } = definition;
    if (encoding.type === "binary") {
      this.byKey.set(encoding.key, definition);
    }
    this.byKind.set(kind, definition);
    return definition;
  }
}

const gaManager = new GAManager();
export const registerGADefinition = gaManager.registerGADefinition.bind(gaManager);

export function provideGAManager() {
  return gaManager;
}
