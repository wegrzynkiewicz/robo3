import { provideScopedReceivingGABus, provideScopedSendingGABus } from "../../../common/action/bus.ts";
import { provideGACodec } from "../../../common/action/codec.ts";
import { GADispatcher } from "../../../common/action/define.ts";
import { provideScopedGADispatcher } from "../../../common/action/dispatcher.ts";
import { provideScopedOnlineGASender } from "../../../common/action/online-sender.ts";
import { provideScopedGAProcessor } from "../../../common/action/processor.ts";
import { provideScopedGAReceiver } from "../../../common/action/receiver.ts";
import { provideScopedWebSocket } from "../../../common/action/socket.ts";
import { ServiceResolver, provideMainServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { SpaceManager, provideSpaceManager } from "../../../common/space/space-manager.ts";
import { Breaker } from "../../../common/utils/breaker.ts";
import { provideScopedWebSocketChannel } from "../../../common/web-socket/web-socket-channel.ts";
import { feedServerGAProcessor } from "./ga-processor.ts";

export interface PlayerContext {
  clientId: number;
  dispatcher: GADispatcher;
  resolver: ServiceResolver;
}

export function provideScopedPlayerContext(): PlayerContext {
  throw new Breaker('player-context-must-be-injected');
}

export interface PlayerContextFactoryOption {
  socket: WebSocket;
  token: string,
}

export class PlayerContextManager {

  public readonly byClientId = new Map<number, PlayerContext>();

  public constructor(
    public readonly loggerFactory: LoggerFactory,
    public readonly mainServiceResolver: ServiceResolver,
    public readonly spaceManager: SpaceManager,
  ) { }

  public async createPlayerContext(options: PlayerContextFactoryOption): Promise<void> {
    const { socket, token } = options;

    const clientId = this.byClientId.size;

    const resolver = this.mainServiceResolver.clone([
      provideGACodec,
      provideSpaceManager,
    ]);

    const logger = this.loggerFactory.createLogger('PLAYER');
    resolver.inject(provideScopedLogger, logger);

    resolver.inject(provideScopedWebSocket, socket);

    const webSocketChannel = resolver.resolve(provideScopedWebSocketChannel);
    {
      const universalGAReceiver = resolver.resolve(provideScopedGAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalGAReceiver);
    }

    const dispatcher = resolver.resolve(provideScopedGADispatcher);

    const context: PlayerContext = {
      clientId,
      resolver,
      dispatcher,
    };
    this.byClientId.set(clientId, context);

    resolver.inject(provideScopedPlayerContext, context);

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
    const being = space.beingManager.obtain(clientId);
  }
}

export function providePlayerContextManager(resolver: ServiceResolver) {
  return new PlayerContextManager(
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideMainServiceResolver),
    resolver.resolve(provideSpaceManager),
  );
}
