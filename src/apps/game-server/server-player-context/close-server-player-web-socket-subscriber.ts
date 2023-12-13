import { ServiceResolver } from "../../../common/dependency/service.ts";
import { WebSocketChannelBusSubscriber } from "../../../common/web-socket/web-socket-channel-bus.ts";
import { ServerPlayerContext, provideScopedServerPlayerContext } from "./define.ts";
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
    resolver.resolve(provideScopedServerPlayerContext),
    resolver.resolve(provideServerPlayerContextManager),
  );
}
