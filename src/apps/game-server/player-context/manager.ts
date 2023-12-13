import { provideScopedReceivingGABus, provideScopedSendingGABus } from "../../../common/action/bus.ts";
import { provideGACodec } from "../../../common/action/codec.ts";
import { provideScopedGADispatcher } from "../../../common/action/dispatcher.ts";
import { provideScopedOnlineGASender } from "../../../common/action/online-sender.ts";
import { provideScopedGAProcessor } from "../../../common/action/processor.ts";
import { provideScopedGAReceiver } from "../../../common/action/receiver.ts";
import { provideScopedWebSocket } from "../../../common/action/socket.ts";
import { ServiceResolver, provideMainServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { SpaceManager, provideSpaceManager } from "../../../common/space/space-manager.ts";
import { provideScopedWebSocketChannel } from "../../../common/web-socket/web-socket-channel.ts";
import { provideClosePlayerWebSocketSubscriber } from "./close-player-web-socket-subscriber.ts";
import { feedServerGAProcessor } from "./ga-processor.ts";
import { PlayerContext, provideScopedPlayerContext } from "./player-context.ts";

export interface PlayerContextFactoryOption {
  socket: WebSocket;
  token: string,
}

export class PlayerContextManager {

  private playerContextIdCounter = 1;
  public readonly byPlayerContextId = new Map<number, PlayerContext>();

  public constructor(
    public readonly loggerFactory: LoggerFactory,
    public readonly mainServiceResolver: ServiceResolver,
    public readonly spaceManager: SpaceManager,
  ) { }

  public async createPlayerContext(options: PlayerContextFactoryOption): Promise<void> {
    const { socket, token } = options;

    const playerContextId = this.playerContextIdCounter++;

    const resolver = this.mainServiceResolver.clone([
      provideGACodec,
      provideSpaceManager,
      providePlayerContextManager,
    ]);

    resolver.inject(provideScopedWebSocket, socket);

    const logger = this.loggerFactory.createLogger('PLAYER');
    resolver.inject(provideScopedLogger, logger);

    const dispatcher = resolver.resolve(provideScopedGADispatcher);

    const context: PlayerContext = {
      playerContextId,
      dispatcher,
      resolver,
    };
    resolver.inject(provideScopedPlayerContext, context);

    const webSocketChannel = resolver.resolve(provideScopedWebSocketChannel);
    {
      const universalGAReceiver = resolver.resolve(provideScopedGAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalGAReceiver);

      const closePlayerWebSocketSubscriber = resolver.resolve(provideClosePlayerWebSocketSubscriber);
      webSocketChannel.closeBus.subscribers.add(closePlayerWebSocketSubscriber);
    }

    const receivedGABus = resolver.resolve(provideScopedReceivingGABus);
    {
      const processor = resolver.resolve(provideScopedGAProcessor);
      feedServerGAProcessor(resolver, processor);
      receivedGABus.subscribers.add(processor);
    }

    const sendingGABus = resolver.resolve(provideScopedSendingGABus);
    {
      const onlineGASender = resolver.resolve(provideScopedOnlineGASender);
      sendingGABus.subscribers.add(onlineGASender);
    }

    const space = this.spaceManager.obtain(1);
    const being = space.beingManager.obtain(playerContextId);

    this.byPlayerContextId.set(playerContextId, context);
  }

  public async destroyPlayerContext(playerContextId: number): Promise<void> {
    this.byPlayerContextId.delete(playerContextId);
  }
}

export function providePlayerContextManager(resolver: ServiceResolver) {
  return new PlayerContextManager(
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideMainServiceResolver),
    resolver.resolve(provideSpaceManager),
  );
}
