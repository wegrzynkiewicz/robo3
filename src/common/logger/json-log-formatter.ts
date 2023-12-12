import { LogFormatter, Log, logSeverityNames } from "./global.ts";

export class JSONLogFormatter implements LogFormatter {
  public format(log: Log): string {
    const { channel, data, date, severity, message } = log;
    const { error, ...others } = data ?? {};
    const errorStack = error instanceof Error ? error.stack : error;
    const json = JSON.stringify({
      date,
      severity: logSeverityNames[severity],
      channel,
      message,
      data: {
        ...others,
        error: errorStack,
      }
    });
    return json;
  }
}
