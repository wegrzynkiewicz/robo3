import { registerService } from "../../dependency/service.ts";
import { registerIdentifier } from "../identifier.ts";
import { GAEncodingDefinition } from "./codec.ts";

export interface GADefinition<TData> {
  encoding: GAEncodingDefinition<TData>;
  key: number;
  kind: string;
}

export type AnyGADefinition = GADefinition<any>;

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

const manager = new GAManager();
export const registerGADefinition = manager.registerGADefinition.bind(manager);

export const gaManagerService = registerService({
  provider: async () => manager,
  singleton: true,
});
