import { provideMePlayer } from "../../../actions/me/me-player.ts";
import { GABusSubscriber, provideScopedReceivingGABus, provideScopedSendingGABus } from "../../../common/action/bus.ts";
import { provideGACodec } from "../../../common/action/codec.ts";
import { GADispatcher } from "../../../common/action/define.ts";
import { provideScopedGADispatcher } from "../../../common/action/dispatcher.ts";
import { provideScopedOnlineGASender } from "../../../common/action/online-sender.ts";
import { provideScopedGAProcessor } from "../../../common/action/processor.ts";
import { provideScopedGAReceiver } from "../../../common/action/receiver.ts";
import { provideScopedWebSocket } from "../../../common/action/socket.ts";
import { provideScopedBeingManager } from "../../../common/being/manager.ts";
import { ServiceResolver, provideMainServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { provideSpaceManager } from "../../../common/space/space-manager.ts";
import { provideOpenWebSocketSubscriber } from "../../../common/web-socket/open-subscriber.ts";
import { provideScopedWebSocketChannel } from "../../../common/web-socket/web-socket-channel.ts";
import { feedClientSideGAProcess } from "./ga-processor.ts";

export interface ClientPlayerContext {
  connector: GABusSubscriber;
  dispatcher: GADispatcher;
  resolver: ServiceResolver;
}

export interface ClientPlayerContextFactoryOption {
  socket: WebSocket;
}

export class ClientPlayerContextManager {
  public constructor(
    private readonly loggerFactory: LoggerFactory,
    private readonly mainServiceResolver: ServiceResolver,
  ) { }

  public async createClientPlayerContext(options: ClientPlayerContextFactoryOption): Promise<ClientPlayerContext> {
    const { socket } = options;

    const resolver = new ServiceResolver();
    this.mainServiceResolver.transfer(provideGACodec, resolver);
    this.mainServiceResolver.transfer(provideSpaceManager, resolver);
    this.mainServiceResolver.transfer(provideMePlayer, resolver);
    this.mainServiceResolver.transfer(provideScopedBeingManager, resolver);
    
    const logger = this.loggerFactory.createLogger('CLIENT');

    resolver.inject(provideScopedWebSocket, socket);
    resolver.inject(provideScopedLogger, logger);

    const webSocketChannel = resolver.resolve(provideScopedWebSocketChannel);
    const openWebSocketSubscriber = resolver.resolve(provideOpenWebSocketSubscriber);
    {
      const universalGAReceiver = resolver.resolve(provideScopedGAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalGAReceiver);
      webSocketChannel.openBus.subscribers.add(openWebSocketSubscriber);
    }

    const receivedGABus = resolver.resolve(provideScopedReceivingGABus);
    {
      const processor = resolver.resolve(provideScopedGAProcessor);
      feedClientSideGAProcess(resolver, processor);
      receivedGABus.subscribers.add(processor);
    }

    const sendingGABus = resolver.resolve(provideScopedSendingGABus);
    {
      const onlineGASender = resolver.resolve(provideScopedOnlineGASender);
      sendingGABus.subscribers.add(onlineGASender);
    }

    const dispatcher = resolver.resolve(provideScopedGADispatcher);

    // const networkLatencyDaemon = resolver.resolve(provideNetworkLatencyDaemon);
    // const mutationGABusSubscriber = resolver.resolve(provideMutationGABusSubscriber);

    await openWebSocketSubscriber.ready;

    const context: ClientPlayerContext = {
      connector: sendingGABus,
      dispatcher,
      resolver,
    };
    return context;
  }
}

export function provideClientPlayerContextManager(resolver: ServiceResolver) {
  return new ClientPlayerContextManager(
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideMainServiceResolver),
  );
}
