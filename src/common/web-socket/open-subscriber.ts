import { deferred } from "../../deps.ts";
import { WebSocketChannelBusSubscriber } from "./web-socket-channel-bus.ts";

export class OpenWebSocketSubscriber implements WebSocketChannelBusSubscriber<Event> {
  public readonly ready = deferred<void>();
  public async subscribe(_event: Event): Promise<void> {
    this.ready.resolve();
  }
}

export function provideOpenWebSocketSubscriber() {
  return new OpenWebSocketSubscriber();
}
