import { Deferred, deferred } from "../deps.ts";
import { Breaker } from "./asserts.ts";

export type UnknownData = Record<string, unknown>;
export type NonEmptyObj<T extends Record<string, unknown>> = T extends Record<string, never> ? never : T;
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function deepClone<T>(object: T): T {
  return JSON.parse(JSON.stringify(object)) as T;
}

export class EncodingTranslation<T> {
  public readonly byIndex = new Map<number, T>();
  public readonly byKey = new Map<string, T>();

  public constructor(
    protected readonly fetchKey: (entry: T) => { index: number; key: string },
  ) {
  }

  public set(entry: T) {
    const { index, key } = this.fetchKey(entry);
    this.byIndex.set(index, entry);
    this.byKey.set(key, entry);
  }
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

  public has(key: TKey): boolean {
    return this.pendingResponses.has(key);
  }

  public resolve(key: TKey, data: TValue): void {
    const promise = this.pendingResponses.get(key);
    if (promise === undefined) {
      throw new Breaker("not-found-pending-promise-by-key", { key });
    }
    promise.resolve(data);
    this.pendingResponses.delete(key);
  }

  public reject(key: TKey, data: Error): void {
    const promise = this.pendingResponses.get(key);
    if (promise === undefined) {
      throw new Breaker("not-found-pending-promise-by-key", { key });
    }
    promise.reject(data);
    this.pendingResponses.delete(key);
  }
}

export function inflate(input: Uint8Array): Promise<ArrayBuffer> {
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  writer.write(input);
  writer.close();
  const arrayBufferPromise = new Response(ds.readable).arrayBuffer();
  return arrayBufferPromise;
}

export class MapSet<TKey, TValue> {
  public readonly map = new Map<TKey, Set<TValue>>();
  public add(key: TKey, value: TValue): void {
    const set = this.fetch(key);
    set.add(value);
  }
  public fetch(key: TKey): Set<TValue> {
    const value = this.map.get(key);
    if (value === undefined) {
      const set = new Set<TValue>();
      this.map.set(key, set);
      return set;
    }
    return value;
  }
}

export class MapList<TKey, TValue> {
  public readonly list = new Map<TKey, TValue[]>();
  public push(key: TKey, value: TValue): void {
    const set = this.fetch(key);
    set.push(value);
  }
  public fetch(key: TKey): TValue[] {
    const value = this.list.get(key);
    if (value === undefined) {
      const list: TValue[] = [];
      this.list.set(key, list);
      return list;
    }
    return value;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const sizes = ["B", "kiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const float = bytes / Math.pow(1024, index);
  return `${float.toFixed(2)} ${sizes[index]}`;
}
