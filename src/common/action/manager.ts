import { registerIdentifier } from "../../core/identifier.ts";
import { AnyGADefinition, GADefinition } from "./define.ts";

export class GAManager {
  public readonly byKey = new Map<number, AnyGADefinition>();
  public readonly byKind = new Map<string, AnyGADefinition>();

  public registerGADefinition<TInstance>(definition: GADefinition<TInstance>): GADefinition<TInstance> {
    const { key, kind } = definition;
    registerIdentifier({ key, kind });
    this.byKey.set(key, definition);
    this.byKind.set(kind, definition);
    return definition;
  }
}

const gaManager = new GAManager();
export const registerGADefinition = gaManager.registerGADefinition.bind(gaManager);

export function provideGAManager() {
  return gaManager;
}
