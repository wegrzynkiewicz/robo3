import { indent } from "../utils/useful.ts";
import { LoggerData, Log } from "./global.ts";

export class PrettyLogFormatter {
  public format(log: Log): string {
    const { channel, data, date, severity, message } = log;
    const dateTime = date.toISOString();
    const params = this.formatData(data);
    return `${dateTime} [${severity}] [${channel}] ${message}${params}`;
  }

  private formatData(data: LoggerData): string {
    if (Object.keys(data).length === 0) {
      return `\n`;
    }
    const { error, ...others } = data;
    let msg = `\n`;
    if (Object.keys(others).length > 0) {
      const json = JSON.stringify(others, null, 2);
      msg += `${indent(json, '  ')}\n`;
    }
    if (error instanceof Error) {
      msg += `${indent(error.stack ?? '', '   ')}\n`;
    }
    return msg;
  }
}
