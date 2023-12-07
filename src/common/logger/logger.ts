export type LoggerData = Record<string, unknown>;

export interface Logger {
  info(msg: string, data?: LoggerData): void;
  warn(msg: string, data?: LoggerData): void;
  error(msg: string, data?: LoggerData): void;
}

export function log(severity: string, msg: string, data?: LoggerData): string {
  const date = new Date().toISOString();
  const json = JSON.stringify({ date, level: severity, msg, data });
  return json;
}

export class ConsoleLogger implements Logger {
  public info(msg: string, data?: LoggerData): void {
    console.info(log('INFO', msg, data));
  }

  public warn(msg: string, data?: LoggerData): void {
    console.warn(log('WARN', msg, data));
  }

  public error(msg: string, data?: LoggerData): void {
    console.error(log('ERROR', msg, data));
  }
}

export const logger = new ConsoleLogger();

export function provideGlobalLogger() {
  return logger;
}
