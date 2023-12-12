import { ServiceResolver } from "../dependency/service.ts";
import { Breaker } from "../utils/breaker.ts";
import { BasicLogger } from "./basic-logger.ts";
import { provideMainLogBus } from "./log-bus.ts";

export type LoggerData = Record<string, unknown>;

export const enum LogSeverity {
  SILLY = 0,
  DEBUG = 1,
  INFO = 2,
  NOTICE = 3,
  WARN = 4,
  ERROR = 5,
  FATAL = 6,
}

export const logSeverityNames: Record<LogSeverity, string> = {
  [LogSeverity.SILLY]: "SILLY",
  [LogSeverity.DEBUG]: "DEBUG",
  [LogSeverity.INFO]: "INFO",
  [LogSeverity.NOTICE]: "NOTICE",
  [LogSeverity.WARN]: "WARN",
  [LogSeverity.ERROR]: "ERROR",
  [LogSeverity.FATAL]: "FATAL",
} as const;

export interface Logger {
  silly(message: string, data?: LoggerData): void;
  debug(message: string, data?: LoggerData): void;
  info(message: string, data?: LoggerData): void;
  notice(message: string, data?: LoggerData): void;
  warn(message: string, data?: LoggerData): void;
  error(message: string, data?: LoggerData): void;
  fatal(message: string, data?: LoggerData): void;
}

export interface Log {
  channel: string;
  data: LoggerData;
  date: Date;
  severity: LogSeverity;
  message: string;
}

export interface LogFilter {
  filter(log: Log): boolean;
}

export interface LogFormatter {
  format(log: Log): string;
}

export function provideMainLogger(resolver: ServiceResolver) {
  return new BasicLogger(
    "GLOBAL",
    resolver.resolve(provideMainLogBus),
    {},
  );
}

export function provideScopedLogger(): Logger {
  throw new Breaker("scoped-logger-must-be-injected");
}
