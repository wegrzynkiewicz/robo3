import { ServiceResolver } from "../../dependency/service.ts";
import { WebSocketChannelBusSubscriber } from "../../web-socket/web-socket-channel-bus.ts";
import { ServerPlayerContext, provideServerPlayerContext } from "./define.ts";
import { ServerPlayerContextManager, provideServerPlayerContextManager } from "./manager.ts";

export class CloseServerPlayerWebSocketSubscriber implements WebSocketChannelBusSubscriber<CloseEvent> {
  public constructor(
    public readonly context: ServerPlayerContext,
    public readonly manager: ServerPlayerContextManager,
  ) { }

  public async subscribe(_event: CloseEvent): Promise<void> {
    const { playerContextId } = this.context;
    this.manager.destroyPlayerContext(playerContextId);
  }
}

export function provideCloseServerPlayerWebSocketSubscriber(resolver: ServiceResolver) {
  return new CloseServerPlayerWebSocketSubscriber(
    resolver.resolve(provideServerPlayerContext),
    resolver.resolve(provideServerPlayerContextManager),
  );
}
