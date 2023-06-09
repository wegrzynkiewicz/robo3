export interface BreakerOptions {
  responseCode?: number;
  [index: string]: unknown;
}

export class Breaker extends Error {
  public readonly options: BreakerOptions;
  constructor(message: string, data?: BreakerOptions) {
    const { error, cause, ...others } = data ?? {};
    super(message, { cause: cause ?? error });
    this.name = "Breaker";
    this.options = data ?? {};
    const json = JSON.stringify(others);
    this.stack += `\n    with parameters ${json}.`;
    if (error) {
      this.stack += `\n    cause error ${error instanceof Error ? error.stack : error}.`;
    }
  }
}

export type Insecurity<T> = {
  [K in keyof T]+?: T[K] extends (() => infer TResult) ? (() => TResult) : (null | undefined | Insecurity<T[K]>);
};

type Data = Record<string, unknown>;

function throws(message: string, data?: Data) {
  throw new Breaker(message, data);
}

export function assertTrue(value: unknown, message: string, data?: Data): asserts value is boolean {
  if (value !== true) {
    throws(message, data);
  }
}

export function assertNonNull<T>(value: T, message: string, data?: Data): asserts value is Exclude<T, null> {
  if (value === null) {
    throws(message, data);
  }
}

export function assertObject<T>(value: unknown, message: string, data?: Data): asserts value is Insecurity<T> {
  if (typeof value !== "object" || value === null) {
    throw new Breaker(message, data);
  }
}

export function assertRequiredString(value: unknown, message: string, data?: Data): asserts value is string {
  if (typeof value !== "string" || value === "") {
    throws(message, data);
  }
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value >= 0 && !isNaN(value);
}

export function assertPositiveNumber(value: unknown, message: string, data?: Data): asserts value is number {
  if (!isPositiveNumber(value)) {
    throws(message, data);
  }
}

export function assertArray<T>(value: unknown, message: string, data?: Data): asserts value is T[] {
  if (Array.isArray(value) === false) {
    throws(message, data);
  }
}
