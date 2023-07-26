export interface BreakerOptions {
  responseCode?: number;
  [index: string]: unknown;
}

export class Breaker extends Error {
  public readonly options: BreakerOptions;
  constructor(msg: string, data?: BreakerOptions) {
    const { error, cause, ...others } = data ?? {};
    super(msg, { cause: cause ?? error });
    this.name = "Breaker";
    this.options = data ?? {};
    const json = JSON.stringify(others);
    this.stack += `\n    with parameters ${json}.`;
    if (error) {
      this.stack += `\n    cause error:\n${error instanceof Error ? error.stack : error}.`;
    }
  }
}

export type Insecurity<T> = {
  [K in keyof T]+?: T[K] extends (() => infer TResult) ? (() => TResult) : (null | undefined | Insecurity<T[K]>);
};

export type AssertData = Record<string, unknown>;

export function throws(msg: string, data?: AssertData): never {
  throw new Breaker(msg, data);
}

export function assertTrue(value: unknown, msg: string, data?: AssertData): asserts value is boolean {
  if (value !== true) {
    throws(msg, data);
  }
}

export function assertEqual<TExpected>(value: unknown, expected: TExpected, msg: string, data?: AssertData): asserts value is TExpected {
  if (value !== expected) {
    throws(msg, data);
  }
}

export function assertNonNull<T>(value: T, msg: string, data?: AssertData): asserts value is Exclude<T, null> {
  if (value === null) {
    throws(msg, data);
  }
}

export function assertObject<T>(value: unknown, msg: string, data?: AssertData): asserts value is Insecurity<T> {
  if (typeof value !== "object" || value === null) {
    throw new Breaker(msg, data);
  }
}

export function assertRecord(value: unknown, msg: string, data?: AssertData): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new Breaker(msg, data);
  }
}

export function isRequiredString(value: unknown): value is string {
  return typeof value === "string" && value !== "";
}

export function assertRequiredString(value: unknown, msg: string, data?: AssertData): asserts value is string {
  if (typeof value !== "string" || value === "") {
    throws(msg, data);
  }
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value >= 0 && !isNaN(value);
}

export function assertPositiveNumber(value: unknown, msg: string, data?: AssertData): asserts value is number {
  if (!isPositiveNumber(value)) {
    throws(msg, data);
  }
}

export function assertArray<T>(value: unknown, msg: string, data?: AssertData): asserts value is T[] {
  if (Array.isArray(value) === false) {
    throws(msg, data);
  }
}
