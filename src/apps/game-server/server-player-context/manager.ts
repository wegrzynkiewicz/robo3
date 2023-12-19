import { provideScopedReceivingGABus, provideScopedSendingGABus } from "../../../common/action/bus.ts";
import { provideGACodec } from "../../../common/action/codec.ts";
import { provideScopedOnlineGASender } from "../../../common/action/online-sender.ts";
import { provideScopedGAProcessor } from "../../../common/action/processor.ts";
import { provideScopedGAReceiver } from "../../../common/action/receiver.ts";
import { provideScopedWebSocket } from "../../../common/action/socket.ts";
import { provideScopedBeingManager } from "../../../common/being/manager.ts";
import { ServiceResolver, provideMainServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { GameSimulatorContextManager, provideGameSimulatorContextManager } from "../../../common/simulator/context/manager.ts";
import { SpaceManager, provideSpaceManager } from "../../../common/space/space-manager.ts";
import { provideScopedSpace } from "../../../common/space/space.ts";
import { assertObject } from "../../../common/utils/asserts.ts";
import { provideScopedWebSocketChannel } from "../../../common/web-socket/web-socket-channel.ts";
import { provideCloseServerPlayerWebSocketSubscriber } from "./close-server-player-web-socket-subscriber.ts";
import { ServerPlayerContext, provideScopedServerPlayerContext } from "./define.ts";
import { feedServerGAProcessor } from "./ga-processor.ts";

export interface ServerPlayerContextFactoryOption {
  socket: WebSocket;
  token: string,
}

export class ServerPlayerContextManager {

  private playerContextIdCounter = 1;
  public readonly byPlayerContextId = new Map<number, ServerPlayerContext>();

  public constructor(
    public readonly gameSimulatorContextManager: GameSimulatorContextManager,
    public readonly loggerFactory: LoggerFactory,
    public readonly mainServiceResolver: ServiceResolver,
    public readonly spaceManager: SpaceManager,
  ) { }

  public async createServerPlayerContext(options: ServerPlayerContextFactoryOption): Promise<void> {
    const { socket, token } = options;

    const spaceId = 1; // TODO: from token; 

    const playerContextId = this.playerContextIdCounter++;

    const resolver = new ServiceResolver();
    this.mainServiceResolver.transfer(provideMainServiceResolver, resolver);
    this.mainServiceResolver.transfer(provideGACodec, resolver);
    this.mainServiceResolver.transfer(provideSpaceManager, resolver);

    const gameSimulatorContext = this.gameSimulatorContextManager.bySpaceId.get(spaceId);
    assertObject(gameSimulatorContext, "game-simulator-context-not-found");
    const beingManager = gameSimulatorContext.resolver.transfer(provideScopedBeingManager, resolver);

    const space = this.spaceManager.obtain(spaceId);
    resolver.inject(provideScopedSpace, space);

    const logger = this.loggerFactory.createLogger('PLAYER');
    resolver.inject(provideScopedLogger, logger);

    resolver.inject(provideScopedWebSocket, socket);

    const being = beingManager.create();

    const context: ServerPlayerContext = {
      beingId: being.id,
      playerContextId,
      resolver,
      spaceId,
    };
    resolver.inject(provideScopedServerPlayerContext, context);

    const webSocketChannel = resolver.resolve(provideScopedWebSocketChannel);
    {
      const universalGAReceiver = resolver.resolve(provideScopedGAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalGAReceiver);

      const closePlayerServerWebSocketSubscriber = resolver.resolve(provideCloseServerPlayerWebSocketSubscriber);
      webSocketChannel.closeBus.subscribers.add(closePlayerServerWebSocketSubscriber);
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

export function provideServerPlayerContextManager(resolver: ServiceResolver) {
  return new ServerPlayerContextManager(
    resolver.resolve(provideGameSimulatorContextManager),
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideMainServiceResolver),
    resolver.resolve(provideSpaceManager),
  );
}
