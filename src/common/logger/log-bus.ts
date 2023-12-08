import { Log } from "./global.ts";

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
  return new MainLogBus();
}
