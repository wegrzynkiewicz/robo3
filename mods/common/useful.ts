import { Breaker } from "./asserts.ts";

export function deepClone<T>(object: T): T {
  return JSON.parse(JSON.stringify(object)) as T;
}

export interface EncodingTranslation<T> {
  readonly byIndex: T[];
  readonly byKey: Map<string, T>;
}

export function concatMaps<T>(...iterables: Map<string, T>[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const iterable of iterables) {
    for (const [key, value] of iterable) {
      if (map.has(key)) {
        throw new Breaker('concat-maps-contain-duplicate-entries', { key });
      }
      map.set(key, value);
    }
  }
  return map;
}
