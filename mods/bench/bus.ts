
export interface BusSubscriber<T extends unknown[]> {
  subscribe(...args: T): void;
}

export interface Bus<T extends unknown[]>{
  dispatch(...args: T): void;
}

export class BasicBus<T extends unknown[]> implements Bus<T> {
  public readonly subscribers = new Set<BusSubscriber<T>>();
  public dispatch(...args: T): void {
    for (const subscriber of this.subscribers) {
      subscriber.subscribe(...args);
    }
  }
}

export class BasicBusSubscriber implements BusSubscriber<[string, number]> {
  public subscribe(args: string, b: number): void {
    const a = 1 + 1;
  }
}

const bus = new BasicBus<[string, number]>();
const subscriber1 = new BasicBusSubscriber();
const subscriber2 = new BasicBusSubscriber();
bus.subscribers.add(subscriber1);
bus.subscribers.add(subscriber2);

Deno.bench('destructive', () => {
  bus.dispatch('hello', 123);
})

export interface ChannelSubscriber<T> {
  subscribe(args: T): void;
}

export interface Channel<T>{
  dispatch(args: T): void;
}

export class BasicChannel<T> implements Channel<T> {
  public readonly subscribers = new Set<ChannelSubscriber<T>>();
  public dispatch(args: T): void {
    for (const subscriber of this.subscribers) {
      subscriber.subscribe(args);
    }
  }
}

export class BasicChannelSubscriber<T extends string> implements ChannelSubscriber<T> {
  public subscribe(args: T): void {
    const a = 1 + 1;
  }
}

const channel = new BasicChannel<string>();
const channelSubscriber1 = new BasicChannelSubscriber<string>();
const channelSubscriber2 = new BasicChannelSubscriber<string>();
channel.subscribers.add(channelSubscriber1);
channel.subscribers.add(channelSubscriber2);

Deno.bench('non-destructive', () => {
  channel.dispatch('hello');
})
