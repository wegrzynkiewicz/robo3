import { registerService } from "../../../core/dependency/service.ts";
import { KeyShortCut } from "./shortcut.ts";

export interface KAInput {
  name: string;
  shortCuts: KeyShortCut[];
}

export interface KADefinition {
  currentShortCuts: KeyShortCut[];
  name: string;
  originalShortCuts: KeyShortCut[];
}

export class KAManager {
  public readonly byName = new Map<string, KADefinition>();

  public registerKADefinition(definition: KAInput): KADefinition {
    const { name, shortCuts } = definition;
    const action: KADefinition = {
      currentShortCuts: shortCuts,
      name,
      originalShortCuts: shortCuts,
    }
    this.byName.set(name, action);
    return action;
  }
}

const manager = new KAManager();
export const registerKADefinition = manager.registerKADefinition.bind(manager);

export const kaManagerService = registerService({
  async provider(): Promise<KAManager> {
    return manager;
  },
  singleton: true,
});
