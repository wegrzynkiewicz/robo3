import { BasicLogFilter } from "./basic-log-filter.ts";
import { BasicLogSubscriber } from "./basic-log-subscriber.ts";
import { Log, LogSeverity } from "./global.ts";
import { PrettyLogFormatter } from "./pretty-log-formatter.ts";

export interface LogBusSubscriber {
  subscribe(log: Log): Promise<void>;
}

export interface LogBus {
  dispatch(log: Log): Promise<void>;
}

export class MainLogBus implements LogBus {
  public readonly subscribers = new Set<LogBusSubscriber>();
  public async dispatch(log: Log): Promise<void> {
    for (const subscriber of this.subscribers) {
      subscriber.subscribe(log);
    }
  }
}

export function provideMainLogBus() {
  const bus = new MainLogBus();
  const subscriber = new BasicLogSubscriber(
    new BasicLogFilter(LogSeverity.INFO),
    new PrettyLogFormatter(),
  );
  bus.subscribers.add(subscriber);
  return bus;
}
