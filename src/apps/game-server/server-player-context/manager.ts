import { provideScopedReceivingCABus, provideScopedSendingCABus } from "../../../common/action/bus.ts";
import { provideCACodec } from "../../../common/action/codec.ts";
import { provideScopedCALogger } from "../../../common/action/logger.ts";
import { provideScopedOnlineCASender } from "../../../common/action/online-sender.ts";
import { provideScopedCAProcessor } from "../../../common/action/processor.ts";
import { provideScopedCAReceiver } from "../../../common/action/receiver.ts";
import { provideScopedWebSocket } from "../../../common/action/socket.ts";
import { provideScopedBeingManager } from "../../../common/being/manager.ts";
import { ServiceResolver, provideMainServiceResolver, provideScopedServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { provideScopedGameSimulatorContextServiceResolver } from "../../../common/simulator/context/manager.ts";
import { provideSpaceManager } from "../../../common/space/space-manager.ts";
import { provideScopedSpace } from "../../../common/space/space.ts";
import { Breaker } from "../../../common/utils/breaker.ts";
import { provideScopedWebSocketChannel } from "../../../common/web-socket/web-socket-channel.ts";
import { provideCloseServerPlayerWebSocketSubscriber } from "./close-server-player-web-socket-subscriber.ts";
import { ServerPlayerContext, provideScopedServerPlayerContext } from "./define.ts";
import { feedServerCAProcessor } from "./ca-processor.ts";

export interface ServerPlayerContextFactoryOption {
  socket: WebSocket;
}

let playerContextIdCounter = 1;

export class ServerPlayerContextManager {

  public readonly byPlayerContextId = new Map<number, ServerPlayerContext>();

  public constructor(
    public readonly loggerFactory: LoggerFactory,
    public readonly scopedServiceResolver: ServiceResolver,
  ) { }

  public async createServerPlayerContext(options: ServerPlayerContextFactoryOption): Promise<void> {
    const { socket } = options;

    const spaceId = 1; // TODO: from token; 

    const playerContextId = playerContextIdCounter++;

    const resolver = new ServiceResolver();
    resolver.inject(provideScopedServerPlayerContextServiceResolver, resolver);
    resolver.inject(provideScopedWebSocket, socket);
    this.scopedServiceResolver.transfer(provideMainServiceResolver, resolver);
    this.scopedServiceResolver.transfer(provideCACodec, resolver);
    this.scopedServiceResolver.transfer(provideSpaceManager, resolver);
    this.scopedServiceResolver.transfer(provideScopedServerPlayerContextManager, resolver);
    const space = this.scopedServiceResolver.transfer(provideScopedSpace, resolver);
    const beingManager = this.scopedServiceResolver.transfer(provideScopedBeingManager, resolver);
    this.scopedServiceResolver.transfer(provideScopedGameSimulatorContextServiceResolver, resolver);

    const being = beingManager.create();
    const beingId = being.id;

    const context: ServerPlayerContext = {
      beingId,
      playerContextId,
      resolver,
      spaceId: space.spaceId,
    };
    resolver.inject(provideScopedServerPlayerContext, context);

    const logger = this.loggerFactory.createLogger('PLAYER', { beingId, playerContextId, spaceId });
    resolver.inject(provideScopedLogger, logger);

    const webSocketChannel = resolver.resolve(provideScopedWebSocketChannel);
    {
      const universalCAReceiver = resolver.resolve(provideScopedCAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalCAReceiver);

      const closePlayerServerWebSocketSubscriber = resolver.resolve(provideCloseServerPlayerWebSocketSubscriber);
      webSocketChannel.closeBus.subscribers.add(closePlayerServerWebSocketSubscriber);
    }

    const receivedCABus = resolver.resolve(provideScopedReceivingCABus);
    {
      const processor = resolver.resolve(provideScopedCAProcessor);
      feedServerCAProcessor(resolver, processor);
      receivedCABus.subscribers.add(processor);

      const logger = resolver.resolve(provideScopedCALogger);
      receivedCABus.subscribers.add(logger);
    }

    const sendingCABus = resolver.resolve(provideScopedSendingCABus);
    {
      const onlineCASender = resolver.resolve(provideScopedOnlineCASender);
      sendingCABus.subscribers.add(onlineCASender);
    }

    this.byPlayerContextId.set(playerContextId, context);
  }

  public async destroyPlayerContext(playerContextId: number): Promise<void> {
    const context = this.byPlayerContextId.get(playerContextId);
    if (context === undefined) {
      return;
    }
    const { beingId, resolver } = context;
    const beingManager = resolver.resolve(provideScopedBeingManager);
    beingManager.destroyBeing(beingId);
    this.byPlayerContextId.delete(playerContextId);
  }
}

export function provideScopedServerPlayerContextServiceResolver(): ServiceResolver {
  throw new Breaker('scoped-server-player-context-service-resolver-must-be-injected');
}

export function provideScopedServerPlayerContextManager(resolver: ServiceResolver) {
  return new ServerPlayerContextManager(
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideScopedGameSimulatorContextServiceResolver),
  );
}
