import { provideScopedReceivingGABus, provideScopedSendingGABus } from "../../../common/action/bus.ts";
import { GACodec, provideGACodec } from "../../../common/action/codec.ts";
import { provideScopedOnlineGASender } from "../../../common/action/online-sender.ts";
import { provideScopedGAProcessor } from "../../../common/action/processor.ts";
import { provideScopedGAReceiver } from "../../../common/action/receiver.ts";
import { provideScopedWebSocket } from "../../../common/action/socket.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { provideScopedWebSocketChannel } from "../../../common/web-socket/web-socket-channel.ts";
import { feedServerGAProcessor } from "./ga-processor.ts";

export interface PlayerContext {
  resolver: ServiceResolver;
}

export interface PlayerContextFactoryOption {
  socket: WebSocket;
  token: string,
}

export class PlayerContextManager {

  public readonly byClientId = new Map<number, PlayerContext>();

  public constructor(
    public readonly gaCodec: GACodec,
    public readonly loggerFactory: LoggerFactory,
  ) { }

  public async createPlayerContext(options: PlayerContextFactoryOption): Promise<PlayerContext> {
    const { socket } = options;
    const clientId = this.byClientId.size;

    const resolver = new ServiceResolver();

    const logger = this.loggerFactory.createLogger('PLAYER');

    resolver.inject(provideScopedWebSocket, socket);
    resolver.inject(provideScopedLogger, logger);
    resolver.inject(provideGACodec, this.gaCodec);

    const webSocketChannel = resolver.resolve(provideScopedWebSocketChannel);
    {
      const universalGAReceiver = resolver.resolve(provideScopedGAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalGAReceiver);
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

    const context: PlayerContext = {
      resolver,
    };
    this.byClientId.set(clientId, context);

    return context;
  }
}

export function providePlayerContextManager(resolver: ServiceResolver) {
  return new PlayerContextManager(
    resolver.resolve(provideGACodec),
    resolver.resolve(provideMainLoggerFactory),
  );
}
