export function deepClone<T>(object: T): T {
  return JSON.parse(JSON.stringify(object)) as T;
}

export interface EncodingTranslation<T> {
  readonly byIndex: T[];
  readonly byKey: Map<string, T>;
}
