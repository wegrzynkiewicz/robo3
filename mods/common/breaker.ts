function indent(data: string): string {
  return data
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
}

export interface BreakerOptions {
  error?: unknown;
  [index: string]: unknown;
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
      msg += error instanceof Error ? indent(error.stack ?? "") : error;
    }
    msg += "\nwith stack trace:";
    super(msg);
    this.name = "BREAKER";
    this.options = options ?? {};
  }
}
