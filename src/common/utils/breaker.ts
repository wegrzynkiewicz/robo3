import { indent } from "./useful.ts";

export interface BreakerOptions {
  error?: unknown;
  [index: string]: unknown;
}

export class Breaker extends Error {
  public readonly code: string;
  public readonly options: BreakerOptions;
  constructor(code: string, options?: BreakerOptions) {
    let msg = code;
    const { error, ...others } = options ?? {};
    const json = JSON.stringify(others, null, 2);
    if (json === "{}") {
      msg += `\nwithout parameters`;
    } else {
      msg += `\nwith parameters:\n`;
      msg += indent(json, '    ');
    }
    if (error) {
      msg += `\nwith cause error:\n`;
      msg += error instanceof Error ? indent(error.stack ?? "", '    ') : error;
    }
    msg += "\nwith stack trace:";
    super(msg);
    this.name = "BREAKER";
    this.code = code;
    this.options = options ?? {};
  }
}
