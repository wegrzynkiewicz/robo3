import { Deferred, deferred } from "../deps.ts";
import { Breaker } from "./asserts.ts";

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function deepClone<T>(object: T): T {
  return JSON.parse(JSON.stringify(object)) as T;
}

export interface EncodingTranslation<T> {
  readonly byIndex: T[];
  readonly byKey: Map<T, number>;
}

export function concatMaps<T>(...iterables: Map<string, T>[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const iterable of iterables) {
    for (const [key, value] of iterable) {
      if (map.has(key)) {
        throw new Breaker("concat-maps-contain-duplicate-entries", { key });
      }
      map.set(key, value);
    }
  }
  return map;
}

export class PendingPromiseCollector<TKey, TValue> {
  public readonly pendingResponses = new Map<TKey, Deferred<TValue>>();

  public create(key: TKey): Promise<TValue> {
    const promise = deferred<TValue>();
    this.pendingResponses.set(key, promise);
    return promise;
  }

  public resolve(key: TKey, data: TValue): void {
    const promise = this.pendingResponses.get(key);
    if (promise === undefined) {
      throw new Breaker("not-found-pending-promise-by-key", { key });
    }
    promise.resolve(data);
    this.pendingResponses.delete(key);
  }
}
