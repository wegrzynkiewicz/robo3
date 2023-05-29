export interface BreakerOptions {
  responseCode?: number;
  [index: string]: unknown;
}

export class Breaker extends Error {
  public readonly options: BreakerOptions;
  constructor(message: string, data?: BreakerOptions) {
    const { error, cause, ...others } = data ?? {};
    super(message, { cause: cause ?? error });
    this.name = "StateError";
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

export function assertNonNegativeNumber(value: unknown, message: string, data?: Data): asserts value is number {
  if (typeof value !== "number" || value < 0 || isNaN(value)) {
    throws(message, data);
  }
}
