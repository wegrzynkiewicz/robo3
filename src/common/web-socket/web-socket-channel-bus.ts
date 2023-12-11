export interface WebSocketChannelBusSubscriber<TEvent> {
  subscribe(event: TEvent): void
}

export interface WebSocketChannelBus<TEvent> {
  dispatch(event: TEvent): void
}

export class BasicWebSocketChannelBus<TEvent> implements WebSocketChannelBus<TEvent> {
  public readonly subscribers = new Set<WebSocketChannelBusSubscriber<TEvent>>();
  public async dispatch(event: TEvent): Promise<void> {
    for (const subscriber of this.subscribers) {
      subscriber.subscribe(event);
    }
  }
}
