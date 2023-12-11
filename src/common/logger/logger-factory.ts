import { ServiceResolver } from "../dependency/service.ts";
import { BasicLogger } from "./basic-logger.ts";
import { Logger, LoggerData } from "./global.ts";
import { LogBus, provideMainLogBus } from "./log-bus.ts";

export interface LoggerFactory {
  createLogger(channel: string, params?: LoggerData): Logger;
}

export class MainLoggerFactory implements LoggerFactory {
  public constructor(
    private readonly logBus: LogBus,
  ) { }

  public createLogger(channel: string, params: LoggerData = {}): Logger {
    return new BasicLogger(channel, this.logBus, params);
  }
}

export function provideMainLoggerFactory(resolver: ServiceResolver) {
  return new MainLoggerFactory(
    resolver.resolve(provideMainLogBus),
  );
}
