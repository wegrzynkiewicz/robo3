import { ServiceResolver } from "../../dependency/service.ts";
import { WebSocketChannelBusSubscriber } from "../../web-socket/web-socket-channel-bus.ts";
import { ServerPlayerContext, provideServerPlayerContext } from "./define.ts";

export class UpdatePlayerWhenWebSocketOpenSubscriber implements WebSocketChannelBusSubscriber<Event> {
  public constructor(
    public readonly context: ServerPlayerContext,
  ) { }

  public async subscribe(_event: Event): Promise<void> {
  }
}

export function provideUpdatePlayerWhenWebSocketOpenSubscriber(resolver: ServiceResolver) {
  return new UpdatePlayerWhenWebSocketOpenSubscriber(
    resolver.resolve(provideServerPlayerContext),
  );
}
