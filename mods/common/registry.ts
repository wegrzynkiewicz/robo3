import { Breaker } from "./asserts.ts";

export type RegistryKeyResolver<T> = (entry: T) => string | symbol;

export class Registry<T> {
  public readonly entities = new Map<string | symbol, T>();
  protected readonly resolveKey: RegistryKeyResolver<T>;

  public constructor(resolveKey: RegistryKeyResolver<T>) {
    this.resolveKey = resolveKey;
  }

  public register(entry: T): void {
    const key = this.resolveKey(entry);
    if (this.entities.has(key)) {
      throw new Breaker("entry-with-key-already-exists", { key });
    }
    this.entities.set(key, entry);
  }
}
