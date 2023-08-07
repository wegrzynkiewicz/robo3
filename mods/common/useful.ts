import { Deferred, deferred } from "../deps.ts";
import { Breaker } from "./asserts.ts";

export type UnknownData = Record<string, unknown>;
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function deepClone<T>(object: T): T {
  return JSON.parse(JSON.stringify(object)) as T;
}

export class EncodingTranslation<T> {
  public readonly byIndex = new Map<number, T>();
  public readonly byKey = new Map<string, T>();

  public constructor(
    protected readonly fetchKey: (entry: T) => { index: number, key: string },
  ) {

  }

  public set(entry: T) {
    const {index, key} = this.fetchKey(entry);
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

  public resolve(key: TKey, data: TValue): void {
    const promise = this.pendingResponses.get(key);
    if (promise === undefined) {
      throw new Breaker("not-found-pending-promise-by-key", { key });
    }
    promise.resolve(data);
    this.pendingResponses.delete(key);
  }
}

export function hex2Buffer(outputBuffer: Uint8Array, hex: string) {
  const length = hex.length;
  for (let i = 0, j = 0; i < length; i += 2, j++) {
    outputBuffer[j] = parseInt(hex.substring(i, i + 2), 16);
  }
}

export function buffer2hex(buffer: Uint8Array): string {
  const hexChars = [];
  for (const byte of buffer) {
    const hexByte = byte.toString(16).padStart(2, "0");
    hexChars.push(hexByte);
  }
  return hexChars.join("");
}

export function inflate(input: Uint8Array): Promise<ArrayBuffer> {
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  writer.write(input);
  writer.close();
  const arrayBufferPromise = new Response(ds.readable).arrayBuffer();
  return arrayBufferPromise;
}
