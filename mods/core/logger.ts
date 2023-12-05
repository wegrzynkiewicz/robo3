import { registerService } from "../dependency/service.ts";

export type LoggerData = Record<string, unknown>;

export interface Logger {
  info(msg: string, data?: LoggerData): void;
  warn(msg: string, data?: LoggerData): void;
  error(msg: string, data?: LoggerData): void;
}

export class ConsoleLogger implements Logger {
  public info(msg: string, data?: LoggerData): void {
    console.log(msg, data);
  }

  public warn(msg: string, data?: LoggerData): void {
    console.warn(msg, data);
  }

  public error(msg: string, data?: LoggerData): void {
    console.error(msg, data);
  }
}

export const globalLoggerService = registerService({
  name: "globalLogger",
  async provider(): Promise<Logger> {
    return new ConsoleLogger();
  },
});
