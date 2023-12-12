import { LogSeverity, Logger, LoggerData } from "./global.ts";
import { LogBus } from "./log-bus.ts";

export class BasicLogger implements Logger {

  public constructor(
    private readonly channel: string,
    private readonly logBus: LogBus,
    private readonly params: LoggerData,
  ) { }

  private log(severity: LogSeverity, message: string, data: LoggerData = {}) {
    this.logBus.dispatch({
      channel: this.channel,
      date: new Date(),
      severity,
      message,
      data: {
        ...this.params,
        ...data,
      },
    });
  }

  public silly(message: string, data?: LoggerData): void {
    this.log(LogSeverity.SILLY, message, data);
  }

  public debug(message: string, data?: LoggerData): void {
    this.log(LogSeverity.DEBUG, message, data);
  }

  public info(message: string, data?: LoggerData): void {
    this.log(LogSeverity.INFO, message, data);
  }

  public notice(message: string, data?: LoggerData): void {
    this.log(LogSeverity.NOTICE, message, data);
  }

  public warn(message: string, data?: LoggerData): void {
    this.log(LogSeverity.WARN, message, data);
  }

  public error(message: string, data?: LoggerData): void {
    this.log(LogSeverity.ERROR, message, data);
  }

  public fatal(message: string, data?: LoggerData): void {
    this.log(LogSeverity.FATAL, message, data);
  }
}
