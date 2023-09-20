import { MapList } from "../../../common/useful.ts";
import { registerService } from "../../../core/dependency/service.ts";
import { AnyUADefinition, UADefinition } from "../ua/foundation.ts";
import { KeyShortCut } from "./KeyShortCut.ts";

export interface KACommon<TData> {
  name: string;
  ua?: {
    definition: UADefinition<TData>,
    data: TData,
  },
}

export interface KAInput<TData> extends KACommon<TData> {
  shortCuts: KeyShortCut[];
}

export interface KADefinition<TData> extends KACommon<TData> {
  currentShortCuts: KeyShortCut[];
  originalShortCuts: KeyShortCut[];
}

export type AnyKADefinition = KADefinition<any>

export class KAManager {
  public readonly byName = new Map<string, AnyKADefinition>();
  public readonly byUADefinition = new MapList<AnyUADefinition, AnyKADefinition>();

  public registerKADefinition<TData>(definition: KAInput<TData>): KADefinition<TData> {
    const { name, shortCuts, ua } = definition;
    const action: KADefinition<TData> = {
      currentShortCuts: shortCuts,
      name,
      originalShortCuts: shortCuts,
      ua,
    }
    if (ua) {
      this.byUADefinition.push(ua.definition, action);
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
