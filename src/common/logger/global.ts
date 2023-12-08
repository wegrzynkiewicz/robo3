import { ServiceResolver } from "../dependency/service.ts";
import { BasicLogFilter } from "./basic-log-filter.ts";
import { BasicLogSubscriber } from "./basic-log-subscriber.ts";
import { BasicLogger } from "./basic-logger.ts";
import { provideMainLogBus } from "./log-bus.ts";
import { PrettyLogFormatter } from "./pretty-log-formatter.ts";

export type LoggerData = Record<string, unknown>;

export const enum LogSeverity {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface Logger {
  info(message: string, data?: LoggerData): void;
  warn(message: string, data?: LoggerData): void;
  error(message: string, data?: LoggerData): void;
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

export function defineLogger(resolver: ServiceResolver) {
  const logBus = resolver.resolve(provideMainLogBus);
  const logger = new BasicLogger(
    "GLOBAL",
    logBus
  );
  const subscriber = new BasicLogSubscriber(
    new BasicLogFilter(),
    new PrettyLogFormatter(),
  );
  logBus.subscribers.add(subscriber);
  return logger;
}

// TODO: this duplicate log bus
export const logger = defineLogger(new ServiceResolver());

export function provideGlobalLogger() {
  return logger;
}
