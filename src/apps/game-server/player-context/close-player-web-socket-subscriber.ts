import { ServiceResolver } from "../../../common/dependency/service.ts";
import { WebSocketChannelBusSubscriber } from "../../../common/web-socket/web-socket-channel-bus.ts";
import { PlayerContextManager, providePlayerContextManager } from "./manager.ts";
import { PlayerContext, provideScopedPlayerContext } from "./player-context.ts";

export class ClosePlayerWebSocketSubscriber implements WebSocketChannelBusSubscriber<CloseEvent> {
  public constructor(
    public readonly playerContext: PlayerContext,
    public readonly playerContextManager: PlayerContextManager,
  ) { }

  public async subscribe(_event: CloseEvent): Promise<void> {
    const { playerContextId } = this.playerContext;
    this.playerContextManager.destroyPlayerContext(playerContextId);
  }
}

export function provideClosePlayerWebSocketSubscriber(resolver: ServiceResolver) {
  return new ClosePlayerWebSocketSubscriber(
    resolver.resolve(provideScopedPlayerContext),
    resolver.resolve(providePlayerContextManager),
  );
}
