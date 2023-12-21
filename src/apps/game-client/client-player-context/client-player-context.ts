import { provideMePlayer } from "../../../actions/me/me-player.ts";
import { CABusSubscriber, provideScopedReceivingCABus, provideScopedSendingCABus } from "../../../common/communication/action/bus.ts";
import { provideCACodec } from "../../../common/communication/action/codec.ts";
import { CADispatcher } from "../../../common/communication/action/define.ts";
import { provideScopedCADispatcher } from "../../../common/communication/action/dispatcher.ts";
import { provideScopedOnlineCASender } from "../../../common/communication/action/online-sender.ts";
import { provideScopedCAProcessor } from "../../../common/communication/action/processor.ts";
import { provideScopedCAReceiver } from "../../../common/communication/action/receiver.ts";
import { provideScopedWebSocket } from "../../../common/communication/action/socket.ts";
import { provideScopedBeingManager } from "../../../common/being/manager.ts";
import { ServiceResolver, provideMainServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { provideSpaceManager } from "../../../common/space/space-manager.ts";
import { provideOpenWebSocketSubscriber } from "../../../common/web-socket/open-subscriber.ts";
import { provideScopedWebSocketChannel } from "../../../common/web-socket/web-socket-channel.ts";
import { feedClientSideCAProcess } from "./ga-processor.ts";

export interface ClientPlayerContext {
  connector: CABusSubscriber;
  dispatcher: CADispatcher;
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
    this.mainServiceResolver.transfer(provideCACodec, resolver);
    this.mainServiceResolver.transfer(provideSpaceManager, resolver);
    this.mainServiceResolver.transfer(provideMePlayer, resolver);
    this.mainServiceResolver.transfer(provideScopedBeingManager, resolver);
    
    const logger = this.loggerFactory.createLogger('CLIENT');

    resolver.inject(provideScopedWebSocket, socket);
    resolver.inject(provideScopedLogger, logger);

    const webSocketChannel = resolver.resolve(provideScopedWebSocketChannel);
    const openWebSocketSubscriber = resolver.resolve(provideOpenWebSocketSubscriber);
    {
      const universalCAReceiver = resolver.resolve(provideScopedCAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalCAReceiver);
      webSocketChannel.openBus.subscribers.add(openWebSocketSubscriber);
    }

    const receivedCABus = resolver.resolve(provideScopedReceivingCABus);
    {
      const processor = resolver.resolve(provideScopedCAProcessor);
      feedClientSideCAProcess(resolver, processor);
      receivedCABus.subscribers.add(processor);
    }

    const sendingCABus = resolver.resolve(provideScopedSendingCABus);
    {
      const onlineCASender = resolver.resolve(provideScopedOnlineCASender);
      sendingCABus.subscribers.add(onlineCASender);
    }

    const dispatcher = resolver.resolve(provideScopedCADispatcher);

    // const networkLatencyDaemon = resolver.resolve(provideNetworkLatencyDaemon);
    // const mutationCABusSubscriber = resolver.resolve(provideMutationCABusSubscriber);

    await openWebSocketSubscriber.ready;

    const context: ClientPlayerContext = {
      connector: sendingCABus,
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
