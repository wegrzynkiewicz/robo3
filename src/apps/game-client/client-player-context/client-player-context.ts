import { provideMePlayer } from "../../../actions/me/me-player.ts";
import { CABusSubscriber, provideReceivingCABus, provideSendingCABus } from "../../../common/communication/action/bus.ts";
import { provideCACodec } from "../../../common/communication/action/codec.ts";
import { CADispatcher } from "../../../common/communication/action/define.ts";
import { provideCADispatcher } from "../../../common/communication/action/dispatcher.ts";
import { provideOnlineCASender } from "../../../common/communication/action/online-sender.ts";
import { provideCAProcessor } from "../../../common/communication/action/processor.ts";
import { provideCAReceiver } from "../../../common/communication/action/receiver.ts";
import { provideWebSocket } from "../../../common/communication/action/socket.ts";
import { provideBeingManager } from "../../../common/being/manager.ts";
import { ServiceResolver, provideMainServiceResolver } from "../../../common/dependency/service.ts";
import { provideLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { provideSpaceManager } from "../../../common/space/space-manager.ts";
import { provideOpenWebSocketSubscriber } from "../../../common/web-socket/open-subscriber.ts";
import { provideWebSocketChannel } from "../../../common/web-socket/web-socket-channel.ts";
import { feedClientSideCAProcess } from "./ga-processor.ts";
import { provideChunkManager } from "../../../domain-client/chunk/chunk-manager.ts";

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
    this.mainServiceResolver.transfer(provideBeingManager, resolver);
    this.mainServiceResolver.transfer(provideChunkManager, resolver);
    
    const logger = this.loggerFactory.createLogger('CLIENT');

    resolver.inject(provideWebSocket, socket);
    resolver.inject(provideLogger, logger);

    const webSocketChannel = resolver.resolve(provideWebSocketChannel);
    const openWebSocketSubscriber = resolver.resolve(provideOpenWebSocketSubscriber);
    {
      const universalCAReceiver = resolver.resolve(provideCAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalCAReceiver);
      webSocketChannel.openBus.subscribers.add(openWebSocketSubscriber);
    }

    const receivedCABus = resolver.resolve(provideReceivingCABus);
    {
      const processor = resolver.resolve(provideCAProcessor);
      feedClientSideCAProcess(resolver, processor);
      receivedCABus.subscribers.add(processor);
    }

    const sendingCABus = resolver.resolve(provideSendingCABus);
    {
      const onlineCASender = resolver.resolve(provideOnlineCASender);
      sendingCABus.subscribers.add(onlineCASender);
    }

    const dispatcher = resolver.resolve(provideCADispatcher);

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
