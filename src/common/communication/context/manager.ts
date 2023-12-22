import { provideReceivingCABus, provideSendingCABus } from "../action/bus.ts";
import { provideCACodec } from "../action/codec.ts";
import { provideCALogger } from "../action/logger.ts";
import { provideOnlineCASender } from "../action/online-sender.ts";
import { provideCAProcessor } from "../action/processor.ts";
import { provideCAReceiver } from "../action/receiver.ts";
import { provideWebSocket } from "../action/socket.ts";
import { provideBeingManager } from "../../being/manager.ts";
import { ServiceResolver, provideMainServiceResolver } from "../../dependency/service.ts";
import { provideLogger } from "../../logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../logger/logger-factory.ts";
import { provideGameSimulationContextServiceResolver } from "../../game/context/manager.ts";
import { provideSpaceManager } from "../../space/space-manager.ts";
import { provideSpace } from "../../space/space.ts";
import { Breaker } from "../../utils/breaker.ts";
import { provideWebSocketChannel } from "../../web-socket/web-socket-channel.ts";
import { provideCloseServerPlayerWebSocketSubscriber } from "./close-server-player-web-socket-subscriber.ts";
import { ServerPlayerContext, provideServerPlayerContext } from "./define.ts";
import { feedServerCAProcessor } from "./ca-processor.ts";
import { provideGADispatcher } from "../../game/action/dispatcher.ts";

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
    resolver.inject(provideServerPlayerContextServiceResolver, resolver);
    resolver.inject(provideWebSocket, socket);
    this.scopedServiceResolver.transfer(provideMainServiceResolver, resolver);
    this.scopedServiceResolver.transfer(provideCACodec, resolver);
    this.scopedServiceResolver.transfer(provideSpaceManager, resolver);
    this.scopedServiceResolver.transfer(provideGADispatcher, resolver);
    this.scopedServiceResolver.transfer(provideServerPlayerContextManager, resolver);
    const space = this.scopedServiceResolver.transfer(provideSpace, resolver);
    const beingManager = this.scopedServiceResolver.transfer(provideBeingManager, resolver);
    this.scopedServiceResolver.transfer(provideGameSimulationContextServiceResolver, resolver);

    const being = beingManager.create();
    const beingId = being.id;

    const context: ServerPlayerContext = {
      beingId,
      playerContextId,
      resolver,
      spaceId: space.spaceId,
    };
    resolver.inject(provideServerPlayerContext, context);

    const logger = this.loggerFactory.createLogger('PLAYER', { beingId, playerContextId, spaceId });
    resolver.inject(provideLogger, logger);

    const webSocketChannel = resolver.resolve(provideWebSocketChannel);
    {
      const universalCAReceiver = resolver.resolve(provideCAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalCAReceiver);

      const closePlayerServerWebSocketSubscriber = resolver.resolve(provideCloseServerPlayerWebSocketSubscriber);
      webSocketChannel.closeBus.subscribers.add(closePlayerServerWebSocketSubscriber);
    }

    const receivedCABus = resolver.resolve(provideReceivingCABus);
    {
      const processor = resolver.resolve(provideCAProcessor);
      feedServerCAProcessor(resolver, processor);
      receivedCABus.subscribers.add(processor);

      const logger = resolver.resolve(provideCALogger);
      receivedCABus.subscribers.add(logger);
    }

    const sendingCABus = resolver.resolve(provideSendingCABus);
    {
      const onlineCASender = resolver.resolve(provideOnlineCASender);
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
    const beingManager = resolver.resolve(provideBeingManager);
    beingManager.destroyBeing(beingId);
    this.byPlayerContextId.delete(playerContextId);
  }
}

export function provideServerPlayerContextServiceResolver(): ServiceResolver {
  throw new Breaker('scoped-server-player-context-service-resolver-must-be-injected');
}

export function provideServerPlayerContextManager(resolver: ServiceResolver) {
  return new ServerPlayerContextManager(
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideGameSimulationContextServiceResolver),
  );
}
