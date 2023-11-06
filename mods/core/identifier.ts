import { Breaker } from "../common/asserts.ts";
import { registerService } from "../dependency/service.ts";

export interface Identifier {
  key: number;
  kind: string;
}

export class IdentifierRegistry {
  public readonly byKey = new Map<number, Identifier>();
  public readonly byKind = new Map<string, Identifier>();

  public registerIdentifier(source: Identifier): Identifier {
    const { key, kind } = source;
    const existsIdentifierByKey = this.byKey.get(key);
    if (existsIdentifierByKey !== undefined) {
      throw new Breaker("identifier-with-key-already-exists", { existsIdentifierByKey, key });
    }
    this.byKey.set(key, source);
    const existsIdentifierByKind = this.byKind.get(kind);
    if (existsIdentifierByKind !== undefined) {
      throw new Breaker("identifier-with-key-kind-exists", { existsIdentifierByKind, key });
    }
    this.byKind.set(kind, source);
    return source;
  }
}

const identifierRegistry = new IdentifierRegistry();
export const registerIdentifier = identifierRegistry.registerIdentifier.bind(identifierRegistry);

export const identifierRegistryService = registerService({
  provider: async (): Promise<IdentifierRegistry> => {
    return identifierRegistry;
  },
  singleton: true,
});
