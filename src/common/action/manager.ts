import { AnyCADefinition, CADefinition } from "./define.ts";

export class CAManager {
  public readonly byKey = new Map<number, AnyCADefinition>();
  public readonly byKind = new Map<string, AnyCADefinition>();

  public registerCADefinition<TInstance>(definition: CADefinition<TInstance>): CADefinition<TInstance> {
    const { encoding, kind } = definition;
    if (encoding.type === "binary") {
      this.byKey.set(encoding.key, definition);
    }
    this.byKind.set(kind, definition);
    return definition;
  }
}

const gaManager = new CAManager();
export const registerCADefinition = gaManager.registerCADefinition.bind(gaManager);

export function provideCAManager() {
  return gaManager;
}
