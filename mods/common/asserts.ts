export interface BreakerOptions {
  error?: unknown;
  [index: string]: unknown;
}

function indent(data: string): string {
  return data
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
}

export class Breaker extends Error {
  public readonly options: BreakerOptions;
  constructor(message?: string, options?: BreakerOptions) {
    let msg = message ?? "unknown-breaker-error";
    const { error, ...others } = options ?? {};
    const json = JSON.stringify(others, null, 2);
    if (json === "{}") {
      msg += `\nwithout parameters`;
    } else {
      msg += `\nwith parameters:\n`;
      msg += indent(json);
    }
    if (error) {
      msg += `\nwith cause error:\n`;
      msg += error instanceof Error
        ? indent(error.stack ?? '')
        : error;
    }
    msg += "\nwith stack trace:";
    super(msg);
    this.name = "BREAKER";
    this.options = options ?? {};
  }
}

export type Insecurity<T> = {
  [K in keyof T]+?: T[K] extends (() => infer TResult) ? (() => TResult) : (null | undefined | Insecurity<T[K]>);
};

export type AssertData = Record<string, unknown>;

export function throws(msg?: string, data?: AssertData): never {
  throw new Breaker(msg ?? "assertion-fail", data);
}

export function assertTrue(value: unknown, msg?: string, data?: AssertData): asserts value is boolean {
  if (value !== true) {
    throws(msg, data);
  }
}

export function assertEqual<TExpected>(value: unknown, expected: TExpected, msg?: string, data?: AssertData): asserts value is TExpected {
  if (value !== expected) {
    throws(msg, data);
  }
}

export function assertNonNull<T>(value: T, msg?: string, data?: AssertData): asserts value is Exclude<T, null> {
  if (value === null) {
    throws(msg, data);
  }
}

export function isObject<T>(value: unknown): value is Insecurity<T> {
  return typeof value === "object" && value !== null;
}

export function assertObject<T>(value: unknown, msg?: string, data?: AssertData): asserts value is Insecurity<T> {
  if (typeof value !== "object" || value === null) {
    throw new Breaker(msg, data);
  }
}

export function assertArrayBuffer<T>(value: unknown, msg?: string, data?: AssertData): asserts value is ArrayBuffer {
  if (!(value instanceof ArrayBuffer)) {
    throw new Breaker(msg, data);
  }
}

export function assertRecord(value: unknown, msg?: string, data?: AssertData): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new Breaker(msg, data);
  }
}

export function isRequiredString(value: unknown): value is string {
  return typeof value === "string" && value !== "";
}

export function assertRequiredString(value: unknown, msg?: string, data?: AssertData): asserts value is string {
  if (typeof value !== "string" || value === "") {
    throws(msg, data);
  }
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value >= 0 && !isNaN(value) && isFinite(value);
}

export function isGreaterThenZero(value: unknown): value is number {
  return typeof value === "number" && value > 0 && !isNaN(value) && isFinite(value);
}

export function assertPositiveNumber(value: unknown, msg?: string, data?: AssertData): asserts value is number {
  if (!isPositiveNumber(value)) {
    throws(msg, data);
  }
}

export function assertArray<T>(value: unknown, msg?: string, data?: AssertData): asserts value is T[] {
  if (Array.isArray(value) === false) {
    throws(msg, data);
  }
}
