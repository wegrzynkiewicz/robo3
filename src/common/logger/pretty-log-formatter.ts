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
      return "";
    }
    const json = JSON.stringify(data, null, 2);
    const formatted = indent(json, '  ');
    return `\n${formatted}`
  }
}
