import { Log, LogFilter } from "./global.ts";

export class BasicLogFilter implements LogFilter {
  public filter(_log: Log): boolean {
    return true;
  }
}
